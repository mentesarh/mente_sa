import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { psychologistsApi, CreatePsychologistData, UpdatePsychologistData } from "@/data/psychologists";
import { toast } from "sonner";
import { withTimeout } from "@/lib/api-utils";

const QUERY_KEY = ["psychologists"];

export const usePsychologists = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: psychologistsApi.getAll,
  });
};

export const usePsychologist = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => psychologistsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePsychologist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePsychologistData) =>
      withTimeout(psychologistsApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Psicólogo criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar psicólogo");
    },
  });
};

export const useUpdatePsychologist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePsychologistData) =>
      withTimeout(psychologistsApi.update(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Psicólogo atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar psicólogo");
    },
  });
};

export const useDeletePsychologist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => psychologistsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Psicólogo excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir psicólogo");
    },
  });
};

export const useTogglePsychologistActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      psychologistsApi.toggleActive(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Status do psicólogo atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });
};


