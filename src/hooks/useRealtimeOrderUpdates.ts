import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook for customer to receive order status updates
export const useCustomerOrderUpdates = (userId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`customer-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Order status updated:", payload);
          
          const newStatus = payload.new.status;
          const oldStatus = payload.old?.status;
          
          if (newStatus !== oldStatus) {
            // Play sound
            playNotificationSound();
            
            // Get status label
            const statusLabels: Record<string, string> = {
              pending: "Pendente",
              confirmed: "Confirmado",
              preparing: "Em Preparação",
              ready: "Pronto para Retirada",
              out_for_delivery: "Saiu para Entrega",
              delivered: "Entregue",
              cancelled: "Cancelado",
            };
            
            const statusLabel = statusLabels[newStatus] || newStatus;
            
            toast({
              title: "Atualização do Pedido",
              description: `Seu pedido foi atualizado para: ${statusLabel}`,
            });
          }
          
          // Refresh orders
          queryClient.invalidateQueries({ queryKey: ["user-orders", userId] });
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, toast, playNotificationSound]);
};

// Hook for company to receive new orders and updates
export const useCompanyOrderUpdates = (companyId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.6;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`company-orders-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          console.log("New order received:", payload);
          
          // Play sound
          playNotificationSound();
          
          toast({
            title: "🎉 Novo Pedido!",
            description: `Pedido no valor de R$ ${Number(payload.new.total).toFixed(2)}`,
          });
          
          // Refresh orders
          queryClient.invalidateQueries({ queryKey: ["orders", companyId] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          // Refresh orders on any update
          queryClient.invalidateQueries({ queryKey: ["orders", companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient, toast, playNotificationSound]);
};
