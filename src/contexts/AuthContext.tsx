import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null; profile: Profile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId?: string | null): Promise<Profile | null> => {
    if (!userId) {
      setProfile(null);
      setRole(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, display_name, full_name, email, company_id, status, created_at, updated_at")
        .eq("id", userId)
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.warn("Erro ao carregar profile:", error);
          if (
            error.code === "PGRST116" ||
            error.message?.includes("does not exist") ||
            error.message?.includes("relation") ||
            error.code === "42P01"
          ) {
            console.error(
              "❌ Tabela 'profiles' não encontrada!\n" +
              "Execute o SQL em supabase/migrations/001_complete_setup.sql"
            );
          } else if (error.code === "PGRST202") {
            console.warn(
              "⚠️ Usuário autenticado mas sem profile. " +
              "Verifique o trigger de criação automática de perfil."
            );
          } else if (
            error.code === "42P17" ||
            error.message?.includes("infinite recursion")
          ) {
            console.error(
              "❌ Recursão infinita na política RLS!\n" +
              "Execute o SQL em supabase/migrations/001_complete_setup.sql"
            );
          }
        }
        setProfile(null);
        setRole(null);
        return null;
      }

      if (!data) {
        setProfile(null);
        setRole(null);
        return null;
      }

      const normalized = data as Profile;
      setProfile(normalized);
      setRole(normalized.role as UserRole);
      return normalized;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Erro inesperado ao carregar profile:", err);
      }
      setProfile(null);
      setRole(null);
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Timeout de segurança: libera a tela em até 8s mesmo sem resposta
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
        const sessionFetch = supabase.auth.getSession();

        const result = await Promise.race([sessionFetch, timeout]);

        if (cancelled) return;

        if (result && "data" in result) {
          const { data } = result;
          setSession(data.session);
          setUser(data.session?.user ?? null);
          if (data.session?.user?.id) {
            await loadProfile(data.session.user.id);
          }
        }
      } catch {
        // ignora erros de rede — a tela de login será exibida normalmente
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user?.id) {
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null; profile: Profile | null }> => {
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tempo limite atingido. Verifique sua conexão.")), 12000)
      );

      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeout,
      ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

      const { data, error } = result;

      if (error) return { error, profile: null };

      setSession(data.session);
      setUser(data.user);
      const fetchedProfile = await loadProfile(data.user?.id);
      return { error: null, profile: fetchedProfile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro de conexão. Tente novamente.";
      return {
        error: { message, name: "NetworkError", status: 0 } as unknown as AuthError,
        profile: null,
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    return loadProfile(session?.user?.id);
  };

  const getDashboardRoute = (): string => {
    if (!role) return "/login";
    return getDashboardRouteByRole(role);
  };

  const value: AuthContextType = {
    user,
    session,
    role,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
