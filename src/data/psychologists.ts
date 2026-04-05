import { supabase } from "@/integrations/supabase/client";

export interface Psychologist {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  crp: string | null;
  specialties: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePsychologistData {
  name: string;
  email?: string;
  phone?: string;
  crp?: string;
  specialties?: string[];
  is_active?: boolean;
}

export interface UpdatePsychologistData extends Partial<CreatePsychologistData> {
  id: string;
}

export const psychologistsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("psychologists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Psychologist[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("psychologists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Psychologist;
  },

  async create(psychologist: CreatePsychologistData) {
    const { data, error } = await supabase
      .from("psychologists")
      .insert([psychologist])
      .select()
      .single();

    if (error) throw error;
    return data as Psychologist;
  },

  async update({ id, ...updates }: UpdatePsychologistData) {
    const { data, error } = await supabase
      .from("psychologists")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Psychologist;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("psychologists")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async toggleActive(id: string, is_active: boolean) {
    return this.update({ id, is_active });
  },
};


