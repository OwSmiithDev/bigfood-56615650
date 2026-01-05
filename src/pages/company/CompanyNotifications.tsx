import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Menu,
  Check,
  CheckCheck,
  Trash2,
  Package,
  AlertTriangle,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { CompanySidebar } from "@/components/company/CompanySidebar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const notificationIcons: Record<string, React.ElementType> = {
  order: ShoppingBag,
  stock: Package,
  plan: CreditCard,
  status_change: Bell,
};

const notificationColors: Record<string, string> = {
  order: "bg-green-500/10 text-green-600 border-green-500/20",
  stock: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  plan: "bg-primary/10 text-primary border-primary/20",
  status_change: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const CompanyNotifications = () => {
  const { user } = useAuth();
  const { company } = useCompany();
  const { data: notifications, isLoading, unreadCount } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredNotifications = filter
    ? notifications?.filter((n) => n.type === filter)
    : notifications;

  const handleMarkRead = async (id: string) => {
    await markRead.mutateAsync(id);
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllRead.mutateAsync(user.id);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNotification.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
              <h1 className="font-display text-lg sm:text-xl font-bold text-foreground truncate flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Marcar todas como lidas</span>
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0 ${
                !filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter("order")}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0 flex items-center gap-2 ${
                filter === "order"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Pedidos
            </button>
            <button
              onClick={() => setFilter("stock")}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0 flex items-center gap-2 ${
                filter === "stock"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Package className="w-4 h-4" />
              Estoque
            </button>
            <button
              onClick={() => setFilter("plan")}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0 flex items-center gap-2 ${
                filter === "plan"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Plano
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => {
                  const Icon = notificationIcons[notification.type] || Bell;
                  const colorClass = notificationColors[notification.type] || "bg-muted text-muted-foreground";
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-card rounded-xl p-4 border ${
                        notification.is_read ? "border-border" : "border-primary/30 shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className={`font-semibold text-sm ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(notification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!notification.is_read && (
                                <button
                                  onClick={() => handleMarkRead(notification.id)}
                                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                                  title="Marcar como lida"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {!notification.is_read && (
                            <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter ? "Nenhuma notificação nesta categoria" : "Nenhuma notificação ainda"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyNotifications;
