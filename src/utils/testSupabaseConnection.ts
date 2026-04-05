/**
 * Utilitário para testar a conexão com o Supabase
 * Execute esta função no console do navegador para verificar se a conexão está funcionando
 */
import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  try {
    console.log("🔍 Testando conexão com Supabase...");
    
    // Verificar se as variáveis de ambiente estão configuradas
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!url || !key) {
      console.error("❌ Variáveis de ambiente não configuradas!");
      console.log("URL:", url ? "✅ Configurada" : "❌ Não configurada");
      console.log("Key:", key ? "✅ Configurada" : "❌ Não configurada");
      return false;
    }
    
    console.log("✅ Variáveis de ambiente configuradas");
    console.log("URL:", url);
    
    // Testar conexão fazendo uma query simples
    const { data, error } = await supabase.from("_test").select("count").limit(1);
    
    // Se der erro de tabela não encontrada, significa que a conexão está funcionando
    // mas a tabela não existe (o que é esperado)
    if (error) {
      if (error.code === "PGRST116" || error.message.includes("does not exist")) {
        console.log("✅ Conexão com Supabase funcionando!");
        console.log("ℹ️  Tabela de teste não existe (esperado)");
        return true;
      }
      console.error("❌ Erro na conexão:", error.message);
      return false;
    }
    
    console.log("✅ Conexão com Supabase funcionando!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao testar conexão:", error);
    return false;
  }
};

// Função para verificar autenticação
export const testSupabaseAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Erro ao verificar sessão:", error.message);
      return false;
    }
    
    if (session) {
      console.log("✅ Usuário autenticado:", session.user.email);
      return true;
    } else {
      console.log("ℹ️  Nenhum usuário autenticado");
      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao verificar autenticação:", error);
    return false;
  }
};


