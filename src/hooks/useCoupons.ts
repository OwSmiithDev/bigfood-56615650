import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      userId,
    }: {
      code: string;
      companyId: string;
      orderTotal: number;
      userId?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .limit(1);

      if (error) throw error;

      const coupon = (data?.[0] as Coupon | undefined) ?? null;
      if (!coupon) {
        throw new Error("Cupom inválido ou não encontrado");
      }

      // Check if coupon is for this company or is global
      if (coupon.company_id && coupon.company_id !== companyId) {
        throw new Error("Cupom não válido para este restaurante");
      }

      // Check validity dates
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        throw new Error("Cupom ainda não está válido");
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        throw new Error("Cupom expirado");
      }

      // Check usage limit
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        throw new Error("Cupom esgotado");
      }

      // Check minimum order value
      if (coupon.min_order_value && orderTotal < coupon.min_order_value) {
        throw new Error(
          `Pedido mínimo de R$ ${coupon.min_order_value.toFixed(2).replace(".", ",")} para usar este cupom`
        );
      }

      // Check if the same logged-in user already used this coupon
      if (userId) {
        const { data: usage, error: usageError } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .eq("coupon_id", coupon.id)
          .limit(1);

        if (usageError) throw usageError;
        if ((usage?.length || 0) > 0) {
          throw new Error("Você já utilizou este cupom anteriormente");
        }
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === "percentage") {
        discount = orderTotal * (coupon.discount_value / 100);
      } else {
        discount = Math.min(coupon.discount_value, orderTotal);
      }

      return {
        coupon,
        discount,
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
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
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
