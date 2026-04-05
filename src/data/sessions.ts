import { supabase } from "@/integrations/supabase/client";

export type SessionStatus = 
  | "scheduled" 
  | "confirmed" 
  | "done" 
  | "cancelled" 
  | "no_show";

export interface Session {
  id: string;
  company_id: string | null;
  employee_id: string | null;
  psychologist_id: string | null;
  scheduled_at: string;
  duration_min: number;
  status: SessionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionWithRelations extends Session {
  company?: { id: string; name: string } | null;
  employee?: { id: string; name: string } | null;
  psychologist?: { id: string; name: string } | null;
}

export interface CreateSessionData {
  company_id: string;
  employee_id: string;
  psychologist_id: string;
  scheduled_at: string;
  duration_min?: number;
  status?: SessionStatus;
  notes?: string;
}

export interface UpdateSessionData extends Partial<CreateSessionData> {
  id: string;
}

export const sessionsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        company:companies(id, name),
        employee:employees(id, name),
        psychologist:psychologists(id, name)
      `)
      .order("scheduled_at", { ascending: false });

    if (error) throw error;
    return data as SessionWithRelations[];
  },

  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        company:companies(id, name),
        employee:employees(id, name),
        psychologist:psychologists(id, name)
      `)
      .gte("scheduled_at", startDate)
      .lte("scheduled_at", endDate)
      .order("scheduled_at", { ascending: true });

    if (error) throw error;
    return data as SessionWithRelations[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        company:companies(id, name),
        employee:employees(id, name),
        psychologist:psychologists(id, name)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as SessionWithRelations;
  },

  async create(session: CreateSessionData) {
    const { data, error } = await supabase
      .from("sessions")
      .insert([session])
      .select()
      .single();

    if (error) throw error;
    return data as Session;
  },

  async update({ id, ...updates }: UpdateSessionData) {
    const { data, error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Session;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: SessionStatus) {
    return this.update({ id, status });
  },

  // Stats para relatórios
  async getStats(startDate?: string, endDate?: string) {
    let query = supabase
      .from("sessions")
      .select("id, status, scheduled_at, company_id");

    if (startDate) query = query.gte("scheduled_at", startDate);
    if (endDate) query = query.lte("scheduled_at", endDate);

    const { data, error } = await query;
    if (error) throw error;

    const total = data.length;
    const done = data.filter(s => s.status === "done").length;
    const cancelled = data.filter(s => s.status === "cancelled").length;
    const noShow = data.filter(s => s.status === "no_show").length;

    return {
      total,
      done,
      cancelled,
      noShow,
      cancellationRate: total > 0 ? ((cancelled + noShow) / total) * 100 : 0,
    };
  },
};


