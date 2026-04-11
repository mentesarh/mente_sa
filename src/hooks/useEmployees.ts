import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi, CreateEmployeeData, UpdateEmployeeData } from "@/data/employees";
import { toast } from "sonner";
import { withTimeout } from "@/lib/api-utils";

const QUERY_KEY = ["employees"];

export const useEmployees = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: employeesApi.getAll,
  });
};

export const useEmployeesByCompany = (companyId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, "company", companyId],
    queryFn: () => employeesApi.getByCompany(companyId),
    enabled: !!companyId,
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeData) =>
      withTimeout(employeesApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Colaborador criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar colaborador");
    },
  });
};

export const useCreateEmployeesBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeData[]) => employeesApi.createBatch(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`${data.length} colaboradores importados com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao importar colaboradores");
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmployeeData) =>
      withTimeout(employeesApi.update(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Colaborador atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar colaborador");
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Colaborador excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir colaborador");
    },
  });
};

export const useToggleEmployeeActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      employeesApi.toggleActive(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Status do colaborador atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });
};


