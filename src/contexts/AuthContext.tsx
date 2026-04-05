import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, getDashboardRouteByRole } from "@/types/roles";

export type { UserRole };

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  full_name?: string | null;
  email?: string | null;
  company_id?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; profile: Profile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole]       = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Cache de profile por userId — evita chamadas duplicadas ao Supabase
  const profileCache = useRef<Map<string, Profile>>(new Map());
  // Controla se o init já terminou — impede que onAuthStateChange
  // rode loadProfile em duplicata na inicialização
  const initDone = useRef(false);

  // ─── Busca profile com cache ──────────────────────────────
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    // Cache hit — retorna sem chamar o Supabase
    if (profileCache.current.has(userId)) {
      const cached = profileCache.current.get(userId)!;
      setProfile(cached);
      setRole(cached.role);
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, display_name, full_name, email, company_id, status, created_at, updated_at")
        .eq("id", userId)
        .single();

      if (error || !data) {
        setProfile(null);
        setRole(null);
        return null;
      }

      const p = data as Profile;
      profileCache.current.set(userId, p);
      setProfile(p);
      setRole(p.role);
      return p;
    } catch {
      setProfile(null);
      setRole(null);
      return null;
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setRole(null);
  };

  // ─── Init: getSession única vez, depois apenas onAuthStateChange ──
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Timeout de 6s — se o Supabase não responder, libera a UI
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 6000)
          ),
        ]);

        if (cancelled) return;

        if (data.session?.user) {
          setSession(data.session);
          setUser(data.session.user);
          await fetchProfile(data.session.user.id);
        }
      } catch {
        // rede falhou — continua sem sessão
      } finally {
        if (!cancelled) {
          initDone.current = true;
          setLoading(false);
        }
      }
    };

    init();

    // onAuthStateChange só age após o init terminar
    // para não duplicar loadProfile na inicialização
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        if (!initDone.current && event === "INITIAL_SESSION") return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user?.id) {
          // Na troca de sessão, invalida cache do usuário anterior se mudou
          if (nextSession.user.id !== user?.id) {
            profileCache.current.delete(nextSession.user.id);
          }
          await fetchProfile(nextSession.user.id);
        } else {
          profileCache.current.clear();
          clearProfile();
        }

        if (!initDone.current) {
          initDone.current = true;
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── signIn ──────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null; profile: Profile | null }> => {
    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tempo limite atingido. Verifique sua conexão.")), 15000)
        ),
      ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

      const { data, error } = result;
      if (error) return { error, profile: null };

      setSession(data.session);
      setUser(data.user);

      // Invalida cache para forçar fetch limpo após login
      if (data.user?.id) profileCache.current.delete(data.user.id);
      const p = await fetchProfile(data.user?.id ?? "");
      return { error: null, profile: p };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro de conexão. Tente novamente.";
      return { error: { message, name: "NetworkError", status: 0 } as unknown as AuthError, profile: null };
    }
  };

  // ─── signOut ─────────────────────────────────────────────
  const signOut = async () => {
    profileCache.current.clear();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    clearProfile();
  };

  // ─── refreshProfile — força re-fetch ignorando cache ─────
  const refreshProfile = async (): Promise<Profile | null> => {
    const uid = session?.user?.id;
    if (!uid) return null;
    profileCache.current.delete(uid);
    return fetchProfile(uid);
  };

  const getDashboardRoute = (): string => {
    if (!role) return "/login";
    return getDashboardRouteByRole(role);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, profile, loading, signIn, signOut, refreshProfile, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
