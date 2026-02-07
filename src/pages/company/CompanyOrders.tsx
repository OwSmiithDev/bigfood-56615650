import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Bell,
  Printer,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useToast } from "@/hooks/use-toast";
import { CompanySidebar } from "@/components/company/CompanySidebar";
import PrintOrderDialog from "@/components/company/PrintOrderDialog";

const statusOptions = [
  { value: "pending", label: "Pendente", color: "bg-yellow-500", icon: Clock },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-500", icon: CheckCircle },
  { value: "preparing", label: "Preparando", color: "bg-purple-500", icon: Package },
  { value: "ready", label: "Pronto", color: "bg-green-500", icon: CheckCircle },
  { value: "out_for_delivery", label: "Em entrega", color: "bg-primary", icon: Truck },
  { value: "delivered", label: "Entregue", color: "bg-accent", icon: CheckCircle },
  { value: "cancelled", label: "Cancelado", color: "bg-destructive", icon: XCircle },
];

const defaultStatus = { value: "pending", label: "Pendente", color: "bg-yellow-500", icon: Clock };

const CompanyOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { company } = useCompany();
  const { data: orders, isLoading } = useOrders(company?.id);
  const updateStatus = useUpdateOrderStatus();

  // Enable realtime notifications
  useRealtimeOrders(company?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<any>(null);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast({ title: "Status atualizado!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const filteredOrders = statusFilter
    ? orders?.filter((o) => o.status === statusFilter)
    : orders;

  const pendingOrdersCount = useMemo(() => {
    return orders?.filter((o) => o.status === "pending").length || 0;
  }, [orders]);

  const getStatusInfo = (status: string | null) =>
    statusOptions.find((s) => s.value === status) || defaultStatus;

  return (
    <div className="min-h-screen bg-background flex">
      <CompanySidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        pendingOrders={pendingOrdersCount}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        <header className="sticky top-0 z-30 bg-card border-b border-border shrink-0">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 shrink-0"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h1 className="font-display text-lg sm:text-xl font-bold text-foreground truncate">
                Pedidos
              </h1>
              {pendingOrdersCount > 0 && (
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold rounded-full animate-pulse shrink-0">
                  <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {pendingOrdersCount}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-6 scrollbar-hide -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all shrink-0 ${
                !statusFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Todos ({orders?.length || 0})
            </button>
            {statusOptions.slice(0, 5).map((status) => {
              const count = orders?.filter((o) => o.status === status.value).length || 0;
              return (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all shrink-0 ${
                    statusFilter === status.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const isPending = order.status === "pending";
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-card rounded-xl shadow-card overflow-hidden ${
                      isPending ? "ring-2 ring-yellow-500 ring-offset-2 ring-offset-background" : ""
                    }`}
                  >
                    <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {order.customer_name || "Cliente"}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-primary-foreground shrink-0 ${statusInfo.color}`}
                      >
                        <statusInfo.icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{statusInfo.label}</span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                        {order.order_items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-xs sm:text-sm"
                          >
                            <span className="text-muted-foreground truncate mr-2">
                              {item.quantity}x {item.product_name}
                            </span>
                            <span className="text-foreground shrink-0">
                              R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.order_type === "delivery" && order.address_street && (
                        <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 truncate">
                          📍 {order.address_street}, {order.address_number} -{" "}
                          {order.address_neighborhood}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border gap-2">
                        <p className="font-bold text-base sm:text-lg text-primary">
                          R$ {order.total.toFixed(2).replace(".", ",")}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="p-1.5 sm:p-2 rounded-lg border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                            title="Imprimir comanda"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <select
                            value={order.status || "pending"}
                            onChange={(e) =>
                              handleUpdateStatus(order.id, e.target.value)
                            }
                            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border bg-background text-xs sm:text-sm min-w-0"
                          >
                            {statusOptions.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </main>

      <PrintOrderDialog
        open={!!printOrder}
        onOpenChange={(open) => !open && setPrintOrder(null)}
        order={printOrder}
      />
    </div>
  );
};

export default CompanyOrders;