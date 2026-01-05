import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useRealtimeUpdates } from "./useRealtimeUpdates";

export const useProducts = (companyId?: string) => {
  // Enable realtime updates for products
  useRealtimeUpdates({
    table: "products",
    queryKey: ["products", companyId || ""],
    companyId,
  });

  return useQuery({
    queryKey: ["products", companyId],
    queryFn: async () => {
      const query = supabase
        .from("products")
        .select("*, product_categories(id, name)")
        .order("sort_order", { ascending: true });

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

export const useProductCategories = (companyId?: string) => {
  // Enable realtime updates for categories
  useRealtimeUpdates({
    table: "product_categories",
    queryKey: ["product_categories", companyId || ""],
    companyId,
  });

  return useQuery({
    queryKey: ["product_categories", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .eq("company_id", companyId!)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: TablesInsert<"products">) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível salvar o produto.");
      return row;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", data.company_id] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: TablesUpdate<"products"> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível atualizar o produto.");
      return row;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", data.company_id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: TablesInsert<"product_categories">) => {
      const { data, error } = await supabase
        .from("product_categories")
        .insert(category)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível criar a categoria.");
      return row;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["product_categories", data.company_id] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: TablesUpdate<"product_categories"> & { id: string }) => {
      const { data, error } = await supabase
        .from("product_categories")
        .update(category)
        .eq("id", id)
        .select()
        .limit(1);

      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error("Não foi possível atualizar a categoria.");
      return row;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["product_categories", data.company_id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_categories"] });
    },
  });
};
