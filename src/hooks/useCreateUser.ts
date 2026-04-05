import { useMutation } from "@tanstack/react-query";
import { usersApi, CreateUserData } from "@/data/users";
import { toast } from "sonner";

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (data: CreateUserData) => usersApi.createUser(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Usuário criado com sucesso!");
      } else {
        toast.error(response.error || "Erro ao criar usuário");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar usuário");
    },
  });
};


