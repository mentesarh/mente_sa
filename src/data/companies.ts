import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  cnpj?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string;
}

export const companiesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Company[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Company;
  },

  async create(company: CreateCompanyData) {
    const { data, error } = await supabase
      .from("companies")
      .insert([company])
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },

  async update({ id, ...updates }: UpdateCompanyData) {
    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async toggleActive(id: string, is_active: boolean) {
    return this.update({ id, is_active });
  },
};


