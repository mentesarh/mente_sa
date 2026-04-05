import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/data/settings";
import { toast } from "sonner";

const QUERY_KEY = ["settings"];

export const useSettings = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: settingsApi.getAll,
  });
};

export const useSetting = (key: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, key],
    queryFn: () => settingsApi.getByKey(key),
    enabled: !!key,
  });
};

export const useUpsertSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: any; description?: string }) =>
      settingsApi.upsert(key, value, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Configuração salva com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar configuração");
    },
  });
};


