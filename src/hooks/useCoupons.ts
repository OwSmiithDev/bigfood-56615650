import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeUpdates } from "./useRealtimeUpdates";

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number | null;
  max_uses: number | null;
  used_count: number;
  company_id: string | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export const useCoupons = (companyId?: string | null) => {
  // Enable realtime updates for coupons
  useRealtimeUpdates({
    table: "coupons",
    queryKey: ["coupons", companyId || ""],
    companyId: companyId || undefined,
  });

  return useQuery({
    queryKey: ["coupons", companyId],
    queryFn: async () => {
      let query = supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId === null) {
        // Get global coupons (admin coupons)
        query = query.is("company_id", null);
      } else if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Coupon[];
    },
  });
};

export const useAllCoupons = () => {
  return useQuery({
    queryKey: ["coupons", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({
      code,
      companyId,
      orderTotal,
    }: {
      code: string;
      companyId: string;
      orderTotal: number;
      userId?: string | null;
    }) => {
      // Use backend edge function for 100% guaranteed validation
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code, companyId, orderTotal },
      });

      if (error) {
        throw new Error(error.message || "Erro ao validar cupom");
      }

      if (!data.success) {
        throw new Error(data.error || "Erro ao validar cupom");
      }

      return {
        coupon: data.coupon as Coupon,
        discount: data.discount as number,
      };
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: Partial<Coupon>) => {
      const { data, error } = await supabase
        .from("coupons")
        .insert({
          ...coupon,
          code: coupon.code?.toUpperCase(),
        })
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível criar o cupom.");
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...coupon }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabase
        .from("coupons")
        .update({
          ...coupon,
          code: coupon.code?.toUpperCase(),
        })
        .eq("id", id)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível atualizar o cupom.");
      return row;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("delete-coupon", {
        body: { couponId: id },
      });

      if (error) {
        throw new Error(error.message || "Erro ao excluir cupom");
      }

      if (data && !data.success) {
        throw new Error(data.error || "Erro ao excluir cupom");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useIncrementCouponUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const { data, error: fetchError } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("id", couponId)
        .limit(1);

      if (fetchError) throw fetchError;
      const current = data?.[0]?.used_count ?? 0;

      const { error } = await supabase
        .from("coupons")
        .update({ used_count: current + 1 })
        .eq("id", couponId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};
