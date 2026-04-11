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

// ─── Helpers ─────────────────────────────────────────────────────────
function raceTimeout<T>(promise: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);
}

// ─────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole]       = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Cache de profile por userId — evita chamadas duplicadas ao Supabase
  const profileCache = useRef<Map<string, Profile>>(new Map());
  // Deduplica fetchProfile concorrentes para o mesmo userId
  const profileFetching = useRef<Map<string, Promise<Profile | null>>>(new Map());
  // Impede que onAuthStateChange duplique o fetchProfile feito no init
  const initDone = useRef(false);

  // ─── Busca profile com cache + deduplicação + timeout ────────────
  const fetchProfile = (userId: string): Promise<Profile | null> => {
    // 1. Cache hit
    if (profileCache.current.has(userId)) {
      const cached = profileCache.current.get(userId)!;
      setProfile(cached);
      setRole(cached.role);
      return Promise.resolve(cached);
    }

    // 2. Já existe uma fetch em andamento para este userId — reutiliza
    if (profileFetching.current.has(userId)) {
      return profileFetching.current.get(userId)!;
    }

    // 3. Nova fetch
    const promise = (async (): Promise<Profile | null> => {
      try {
        const { data, error } = await raceTimeout(
          supabase
            .from("profiles")
            .select("id, role, display_name, full_name, email, company_id, status, created_at, updated_at")
            .eq("id", userId)
            .single(),
          25000, // 25s — DB pode ainda estar aquecendo após Auth responder
          "Tempo limite ao buscar perfil de usuário."
        );

        if (error || !data) {
          // Não limpa role/profile se já tínhamos um perfil válido antes —
          // uma falha de rede transitória não deve deslogar o usuário.
          // Só limpa se realmente não há nada em cache.
          if (!profileCache.current.has(userId)) {
            setProfile(null);
            setRole(null);
          }
          return null;
        }

        const p = data as Profile;
        profileCache.current.set(userId, p);
        setProfile(p);
        setRole(p.role);
        return p;
      } catch {
        // Falha de rede/timeout — mantém estado anterior
        if (!profileCache.current.has(userId)) {
          setProfile(null);
          setRole(null);
        }
        return null;
      } finally {
        profileFetching.current.delete(userId);
      }
    })();

    profileFetching.current.set(userId, promise);
    return promise;
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
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 8000)
          ),
        ]);

        if (cancelled) return;

        if (data.session?.user) {
          setSession(data.session);
          setUser(data.session.user);
          await fetchProfile(data.session.user.id);
        }
      } catch {
        // rede falhou — libera a UI sem sessão
      } finally {
        if (!cancelled) {
          initDone.current = true;
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        // Durante o init, INITIAL_SESSION é tratado no init() — ignora aqui
        if (!initDone.current && event === "INITIAL_SESSION") return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user?.id) {
          // Invalida cache se usuário mudou
          if (nextSession.user.id !== user?.id) {
            profileCache.current.delete(nextSession.user.id);
          }
          // fetchProfile é deduplicado — não há dupla chamada ao DB
          await fetchProfile(nextSession.user.id);
        } else {
          profileCache.current.clear();
          profileFetching.current.clear();
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

  // ─── signIn ──────────────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null; profile: Profile | null }> => {
    try {
      // 40s — cobre cold start do Supabase free tier (~25-30s) + margem
      const result = await raceTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        40000,
        "Servidor demorou para responder. Tente novamente em instantes."
      ) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

      const { data, error } = result;
      if (error) return { error, profile: null };

      setSession(data.session);
      setUser(data.user);

      // Invalida cache para forçar fetch limpo após login
      if (data.user?.id) {
        profileCache.current.delete(data.user.id);
        profileFetching.current.delete(data.user.id);
      }

      // fetchProfile é deduplicado — onAuthStateChange pode ter iniciado
      // uma fetch; aqui reutilizamos a mesma promise se já estiver em voo
      const p = await fetchProfile(data.user?.id ?? "");
      return { error: null, profile: p };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro de conexão. Tente novamente.";
      return {
        error: { message, name: "NetworkError", status: 0 } as unknown as AuthError,
        profile: null,
      };
    }
  };

  // ─── signOut ─────────────────────────────────────────────────────
  const signOut = async () => {
    profileCache.current.clear();
    profileFetching.current.clear();
    // signOut não precisa esperar o servidor — limpa local imediatamente
    supabase.auth.signOut().catch(() => {}); // fire-and-forget com segurança
    setUser(null);
    setSession(null);
    clearProfile();
  };

  // ─── refreshProfile — força re-fetch ignorando cache ─────────────
  const refreshProfile = async (): Promise<Profile | null> => {
    const uid = session?.user?.id;
    if (!uid) return null;
    profileCache.current.delete(uid);
    profileFetching.current.delete(uid);
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
