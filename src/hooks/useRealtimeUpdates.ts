import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type RealtimeTable = "products" | "product_categories" | "coupons" | "companies";

interface UseRealtimeUpdatesOptions {
  table: RealtimeTable;
  queryKey: string[];
  companyId?: string;
}

export const useRealtimeUpdates = ({ table, queryKey, companyId }: UseRealtimeUpdatesOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channelName = companyId ? `${table}-${companyId}` : `${table}-all`;
    
    console.log(`Setting up realtime for ${table}`, { companyId, queryKey });

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(companyId && { filter: `company_id=eq.${companyId}` }),
        },
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload.eventType, payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status);
      });

    return () => {
      console.log(`Removing realtime channel for ${table}`);
      supabase.removeChannel(channel);
    };
  }, [table, queryClient, companyId, JSON.stringify(queryKey)]);
};

// Hook specifically for company/restaurant updates
export const useRealtimeCompany = (companyId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`company-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "companies",
          filter: `id=eq.${companyId}`,
        },
        (payload) => {
          console.log("Company update:", payload);
          queryClient.invalidateQueries({ queryKey: ["restaurant", companyId] });
          queryClient.invalidateQueries({ queryKey: ["restaurants"] });
          queryClient.invalidateQueries({ queryKey: ["company"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);
};
