import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats, useAdminCompanies } from "@/hooks/useAdmin";
import { OrdersChart } from "@/components/company/OrdersChart";

const statCards = [
  { 
    icon: Building2, 
    label: "Total Empresas", 
    key: "totalCompanies" as const,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    icon: Users, 
    label: "Total Usuários", 
    key: "totalUsers" as const,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  { 
    icon: ShoppingBag, 
    label: "Total Pedidos", 
    key: "totalOrders" as const,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  { 
    icon: DollarSign, 
    label: "Receita Total", 
    key: "totalRevenue" as const,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    isCurrency: true
  },
];

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: companies, isLoading: companiesLoading } = useAdminCompanies();

  const pendingCompanies = companies?.filter(
    c => c.subscriptions?.[0]?.status === "pending"
  ) || [];

  const recentCompanies = companies?.slice(0, 5) || [];

  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral do sistema">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="order-2 sm:order-1">
                    <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">
                      {statsLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : stat.isCurrency ? (
                        `R$ ${(stats?.[stat.key] || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      ) : (
                        stats?.[stat.key] || 0
                      )}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.bgColor} order-1 sm:order-2 self-start`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-green-500/10 shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Assinaturas Ativas</p>
                <p className="text-lg sm:text-xl font-bold">{stats?.activeSubscriptions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-yellow-500/10 shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Aguardando Aprovação</p>
                <p className="text-lg sm:text-xl font-bold">{stats?.pendingSubscriptions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10 shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Taxa de Conversão</p>
                <p className="text-lg sm:text-xl font-bold">
                  {stats?.totalCompanies 
                    ? Math.round((stats.activeSubscriptions / stats.totalCompanies) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart */}
      <div className="mb-6 sm:mb-8">
        <OrdersChart showCategoryFilter={true} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
              Aguardando Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            {companiesLoading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 sm:h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pendingCompanies.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 sm:py-8 text-xs sm:text-sm">
                Nenhuma empresa aguardando aprovação
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {pendingCompanies.slice(0, 5).map(company => (
                  <div 
                    key={company.id}
                    className="flex items-center justify-between p-2.5 sm:p-4 bg-muted/50 rounded-lg gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{company.display_name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{company.category}</p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs bg-yellow-500/10 text-yellow-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0">
                      Pendente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              Empresas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            {companiesLoading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 sm:h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentCompanies.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 sm:py-8 text-xs sm:text-sm">
                Nenhuma empresa cadastrada ainda
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentCompanies.map(company => {
                  const status = company.subscriptions?.[0]?.status;
                  const statusColors: Record<string, string> = {
                    active: "bg-green-500/10 text-green-600",
                    pending: "bg-yellow-500/10 text-yellow-600",
                    paused: "bg-red-500/10 text-red-600",
                    expired: "bg-gray-500/10 text-gray-600",
                  };
                  const statusLabels: Record<string, string> = {
                    active: "Ativo",
                    pending: "Pendente",
                    paused: "Pausado",
                    expired: "Expirado",
                  };

                  return (
                    <div 
                      key={company.id}
                      className="flex items-center justify-between p-2.5 sm:p-4 bg-muted/50 rounded-lg gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{company.display_name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {company.subscriptions?.[0]?.plans?.name || "Sem plano"}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${statusColors[status || "pending"]}`}>
                        {statusLabels[status || "pending"]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;