import { useMutation } from "@tanstack/react-query";
import { usersApi, CreateUserData } from "@/data/users";
import { toast } from "sonner";
import { withTimeout } from "@/lib/api-utils";

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (data: CreateUserData) =>
      withTimeout(usersApi.createUser(data), 20000, "A criação do usuário demorou muito. Verifique a conexão e tente novamente."),
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


