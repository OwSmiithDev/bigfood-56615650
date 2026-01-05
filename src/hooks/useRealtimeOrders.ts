import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeOrders = (companyId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!companyId) return;

    console.log("Setting up realtime subscription for company:", companyId);

    const channel = supabase
      .channel(`orders-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          console.log("New order received:", payload);
          
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {
            // Ignore audio errors (autoplay policy)
          });

          toast({
            title: "🔔 Novo Pedido!",
            description: `Pedido de ${(payload.new as any).customer_name || 'Cliente'} - R$ ${((payload.new as any).total || 0).toFixed(2)}`,
            duration: 10000,
          });

          // Invalidate orders query to refresh the list
          queryClient.invalidateQueries({ queryKey: ["orders", companyId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          console.log("Order updated:", payload);
          queryClient.invalidateQueries({ queryKey: ["orders", companyId] });
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient, toast]);
};
