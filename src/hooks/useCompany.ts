import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Company = Database["public"]["Tables"]["companies"]["Row"];
type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

export const useCompany = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading, error } = useQuery({
    queryKey: ["company", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createCompany = useMutation({
    mutationFn: async (companyData: Omit<CompanyInsert, "user_id">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("companies")
        .insert({ ...companyData, user_id: user.id })
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível criar a empresa.");
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });

  const updateCompany = useMutation({
    mutationFn: async (updates: CompanyUpdate) => {
      if (!company) throw new Error("No company found");

      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", company.id)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível salvar as configurações.");
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });

  return {
    company,
    isLoading,
    error,
    createCompany,
    updateCompany,
  };
};

export const useSubscription = (companyId?: string) => {
  return useQuery({
    queryKey: ["subscription", companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};
