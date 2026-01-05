import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";

export const useOrders = (companyId?: string) => {
  return useQuery({
    queryKey: ["orders", companyId],
    queryFn: async () => {
      const query = supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (companyId) {
        query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: TablesInsert<"orders">;
      items: TablesInsert<"order_items">[];
    }) => {
      const { data, error: orderError } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .limit(1);

      if (orderError) throw orderError;
      const orderData = data?.[0];
      if (!orderData) throw new Error("Não foi possível criar o pedido.");

      const orderItems = items.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders", data.company_id] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível atualizar o status.");
      return row;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders", data.company_id] });
    },
  });
};

export const useUserOrders = (userId?: string) => {
  return useQuery({
    queryKey: ["user-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), companies(display_name, logo_url)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
