import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];

export const useAdminCompanies = () => {
  return useQuery({
    queryKey: ["admin", "companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          subscriptions (
            id,
            plan_id,
            status,
            started_at,
            expires_at,
            paused_at,
            notes,
            plans (
              id,
              name,
              price
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      return profiles.map(profile => ({
        ...profile,
        user_roles: roles?.filter(r => r.user_id === profile.id) || []
      }));
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [companiesRes, usersRes, ordersRes, subsRes] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total", { count: "exact" }),
        supabase.from("subscriptions").select("status"),
      ]);

      const activeSubscriptions = subsRes.data?.filter(s => s.status === "active").length || 0;
      const pendingSubscriptions = subsRes.data?.filter(s => s.status === "pending").length || 0;
      const totalRevenue = ordersRes.data?.reduce((acc, o) => acc + (Number(o.total) || 0), 0) || 0;

      return {
        totalCompanies: companiesRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue,
        activeSubscriptions,
        pendingSubscriptions,
      };
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      status,
      planId,
      expiresAt,
      notes,
    }: {
      subscriptionId: string;
      status?: SubscriptionStatus;
      planId?: string;
      expiresAt?: string | null;
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = {};

      if (status) {
        updates.status = status;
        if (status === "active") {
          updates.started_at = new Date().toISOString();
          updates.paused_at = null;
        } else if (status === "paused") {
          updates.paused_at = new Date().toISOString();
        }
      }

      if (planId) updates.plan_id = planId;
      if (expiresAt !== undefined) updates.expires_at = expiresAt;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", subscriptionId)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível atualizar a assinatura.");
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
};

export const useToggleCompanyOpen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, isOpen }: { companyId: string; isOpen: boolean }) => {
      const { data, error } = await supabase
        .from("companies")
        .update({ is_open: isOpen })
        .eq("id", companyId)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível atualizar o status da loja.");
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    },
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          companies(display_name, logo_url)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      action 
    }: { 
      userId: string; 
      role: Database["public"]["Enums"]["app_role"]; 
      action: "add" | "remove" 
    }) => {
      if (action === "add") {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", companyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // First delete user roles
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      // Then delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
