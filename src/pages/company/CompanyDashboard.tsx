import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Menu,
  TrendingUp,
  Clock,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useOrders } from "@/hooks/useOrders";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { CompanySidebar } from "@/components/company/CompanySidebar";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { company, isLoading: loadingCompany } = useCompany();
  const { data: orders } = useOrders(company?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Enable realtime notifications
  useRealtimeOrders(company?.id);

  const todayOrders = orders?.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
  ) || [];

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  const pendingOrdersCount = pendingOrders.length;

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

  if (loadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <h2 className="font-display text-xl font-bold text-foreground">
          Nenhuma empresa encontrada
        </h2>
        <p className="text-muted-foreground text-center">
          Você precisa cadastrar sua empresa primeiro
        </p>
        <Link to="/cadastrar-empresa">
          <Button variant="hero">Cadastrar empresa</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <CompanySidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        pendingOrders={pendingOrdersCount}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="font-display text-xl font-bold text-foreground">
                Dashboard
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Pedidos Hoje</p>
                  <p className="text-2xl font-bold text-foreground">
                    {todayOrders.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Faturamento</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {todayRevenue.toFixed(0)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {pendingOrders.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Pedidos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders?.length || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card rounded-xl shadow-card">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Pedidos Recentes</h2>
            </div>
            <div className="divide-y divide-border">
              {orders && orders.length > 0 ? (
                orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {order.customer_name || "Cliente"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : order.status === "confirmed"
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.status === "pending"
                          ? "Pendente"
                          : order.status === "confirmed"
                          ? "Confirmado"
                          : order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum pedido ainda
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
