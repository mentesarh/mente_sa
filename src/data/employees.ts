import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  company_id: string | null;
  name: string;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithCompany extends Employee {
  company?: {
    id: string;
    name: string;
  };
}

export interface CreateEmployeeData {
  company_id: string;
  name: string;
  email?: string;
  cpf?: string;
  phone?: string;
  is_active?: boolean;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id: string;
}

export const employeesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("employees")
      .select(`
        *,
        company:companies(id, name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as EmployeeWithCompany[];
  },

  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Employee[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("employees")
      .select(`
        *,
        company:companies(id, name)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as EmployeeWithCompany;
  },

  async create(employee: CreateEmployeeData) {
    const { data, error } = await supabase
      .from("employees")
      .insert([employee])
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  },

  async createBatch(employees: CreateEmployeeData[]) {
    const { data, error } = await supabase
      .from("employees")
      .insert(employees)
      .select();

    if (error) throw error;
    return data as Employee[];
  },

  async update({ id, ...updates }: UpdateEmployeeData) {
    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async toggleActive(id: string, is_active: boolean) {
    return this.update({ id, is_active });
  },
};


