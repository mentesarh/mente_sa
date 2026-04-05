import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/roles";

export interface CreateUserData {
  email: string;
  password?: string;
  role: UserRole;
  display_name: string;
  company_id?: string;
  psychologist_id?: string;
  employee_id?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  password?: string;
  message?: string;
  error?: string;
}

export const usersApi = {
  async createUser(userData: CreateUserData): Promise<CreateUserResponse> {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: userData,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Erro ao criar usuário",
      };
    }

    return data as CreateUserResponse;
  },
};
