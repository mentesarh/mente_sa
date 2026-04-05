import { supabase } from "@/integrations/supabase/client";

export interface Setting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const settingsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .order("key", { ascending: true });

    if (error) throw error;
    return data as Setting[];
  },

  async getByKey(key: string) {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error) throw error;
    return data as Setting;
  },

  async upsert(key: string, value: any, description?: string) {
    const { data, error} = await supabase
      .from("settings")
      .upsert({
        key,
        value,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Setting;
  },
};


