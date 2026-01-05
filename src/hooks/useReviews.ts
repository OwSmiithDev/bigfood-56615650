import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateReviewData {
  user_id: string;
  company_id: string;
  order_id: string;
  rating: number;
  comment?: string;
}

export const useReviews = (companyId?: string) => {
  return useQuery({
    queryKey: ["reviews", companyId],
    queryFn: async () => {
      // First get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Then get profiles for each review
      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      return reviews.map(review => ({
        ...review,
        profiles: profiles?.find(p => p.id === review.user_id) || null
      }));
    },
    enabled: !!companyId,
  });
};

export const useUserReviews = (userId?: string) => {
  return useQuery({
    queryKey: ["user-reviews", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, companies(display_name, logo_url)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useOrderReview = (orderId?: string) => {
  return useQuery({
    queryKey: ["order-review", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("order_id", orderId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", data.company_id] });
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["order-review", data.order_id] });
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
  });
};
