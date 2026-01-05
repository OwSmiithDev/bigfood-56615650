import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package,
  Star,
  MapPin,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useUserOrders } from "@/hooks/useOrders";
import { useOrderReview, useCreateReview } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pendente", icon: Clock, color: "bg-yellow-500/10 text-yellow-600" },
  confirmed: { label: "Confirmado", icon: Package, color: "bg-blue-500/10 text-blue-600" },
  preparing: { label: "Preparando", icon: Package, color: "bg-orange-500/10 text-orange-600" },
  ready: { label: "Pronto", icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
  delivered: { label: "Entregue", icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
  canceled: { label: "Cancelado", icon: XCircle, color: "bg-red-500/10 text-red-600" },
};

const ReviewDialog = ({ 
  order, 
  open, 
  onOpenChange 
}: { 
  order: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: existingReview } = useOrderReview(order?.id);
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!user || !order) return;

    try {
      await createReview.mutateAsync({
        user_id: user.id,
        company_id: order.company_id,
        order_id: order.id,
        rating,
        comment: comment || undefined,
      });

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar avaliação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (existingReview) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sua Avaliação</DialogTitle>
            <DialogDescription>
              Você já avaliou este pedido
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-1 justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= existingReview.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            {existingReview.comment && (
              <p className="text-center text-muted-foreground">{existingReview.comment}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar Pedido</DialogTitle>
          <DialogDescription>
            Como foi sua experiência com {order?.companies?.display_name}?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-1 justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Deixe um comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createReview.isPending}>
            {createReview.isPending ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const OrderHistory = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useUserOrders(user?.id);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const canReview = (order: any) => {
    return order.status === "delivered" || order.status === "ready";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/home">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Meus Pedidos</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pedido ainda</h2>
              <p className="text-muted-foreground mb-6">
                Explore os restaurantes e faça seu primeiro pedido!
              </p>
              <Link to="/home">
                <Button>Ver Restaurantes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status || "pending"];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            {order.companies?.logo_url ? (
                              <img 
                                src={order.companies.logo_url} 
                                alt="" 
                                className="w-full h-full object-cover rounded-xl" 
                              />
                            ) : (
                              <ShoppingBag className="w-7 h-7 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold truncate">
                                {order.companies?.display_name || "Restaurante"}
                              </h3>
                              <Badge className={status.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(new Date(order.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {order.order_items?.slice(0, 3).map((item: any, i: number) => (
                                <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                                  {item.quantity}x {item.product_name}
                                </span>
                              ))}
                              {order.order_items && order.order_items.length > 3 && (
                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                  +{order.order_items.length - 3} itens
                                </span>
                              )}
                            </div>
                            {order.address_street && (
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {order.address_street}, {order.address_number}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-lg font-bold text-primary">
                            R$ {Number(order.total).toFixed(2)}
                          </p>
                          {canReview(order) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setReviewDialogOpen(true);
                              }}
                              className="gap-2"
                            >
                              <Star className="w-4 h-4" />
                              Avaliar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Review Dialog */}
      {selectedOrder && (
        <ReviewDialog
          order={selectedOrder}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
        />
      )}
    </div>
  );
};

export default OrderHistory;
