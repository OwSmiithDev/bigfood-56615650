import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRestaurants = (category?: string, searchTerm?: string) => {
  return useQuery({
    queryKey: ["restaurants", category, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("companies")
        .select("*")
        .order("rating", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (searchTerm) {
        query = query.or(`display_name.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          product_categories (
            id,
            name,
            sort_order,
            products (
              id,
              name,
              description,
              price,
              image_url,
              available,
              featured,
              sort_order
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["restaurant-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(c => c.category).filter(Boolean))];
      return uniqueCategories as string[];
    },
  });
};
