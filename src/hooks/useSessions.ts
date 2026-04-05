import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi, CreateSessionData, UpdateSessionData, SessionStatus } from "@/data/sessions";
import { toast } from "sonner";

const QUERY_KEY = ["sessions"];

export const useSessions = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: sessionsApi.getAll,
  });
};

export const useSessionsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, "range", startDate, endDate],
    queryFn: () => sessionsApi.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => sessionsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionData) => sessionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Sessão agendada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao agendar sessão");
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSessionData) => sessionsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Sessão atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar sessão");
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Sessão excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir sessão");
    },
  });
};

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SessionStatus }) =>
      sessionsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Status da sessão atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });
};

export const useSessionStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, "stats", startDate, endDate],
    queryFn: () => sessionsApi.getStats(startDate, endDate),
  });
};


