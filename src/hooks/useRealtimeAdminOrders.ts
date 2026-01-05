import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeAdminOrders = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up realtime subscription for admin orders");

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("New order received (admin):", payload);

          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {
            // Ignore audio errors (autoplay policy)
          });

          toast({
            title: "🔔 Novo Pedido!",
            description: `Pedido de ${(payload.new as any).customer_name || "Cliente"} - R$ ${(((payload.new as any).total as number) || 0).toFixed(2)}`,
            duration: 10000,
          });

          queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order updated (admin):", payload);
          queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status (admin-orders):", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription (admin-orders)");
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
};
