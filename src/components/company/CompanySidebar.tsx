import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Star,
  Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany, useSubscription } from "@/hooks/useCompany";
import { getPlanById } from "@/constants/plans";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/empresa" },
  { icon: Package, label: "Produtos", path: "/empresa/produtos" },
  { icon: ShoppingBag, label: "Pedidos", path: "/empresa/pedidos" },
  { icon: Star, label: "Avaliações", path: "/empresa/avaliacoes" },
  { icon: Settings, label: "Configurações", path: "/empresa/config" },
];

interface CompanySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrders?: number;
}

export const CompanySidebar = ({ isOpen, onClose, pendingOrders = 0 }: CompanySidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { company } = useCompany();
  const { data: subscription } = useSubscription(company?.id);

  const currentPlan = getPlanById(subscription?.plan_id || "free");

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleManagePlan = () => {
    navigate("/empresa/gerenciar-plano");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.display_name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {company?.display_name?.charAt(0) || "E"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground truncate">
                  {company?.display_name || "Empresa"}
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {company?.category || "Restaurante"}
                </p>
              </div>
              <button
                onClick={handleManagePlan}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                title="Gerenciar Plano"
              >
                <Crown className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400" />
              </button>
            </div>
            {/* Current Plan Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {currentPlan?.name || "Plano Grátis"}
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const showBadge = item.path === "/empresa/pedidos" && pendingOrders > 0;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="absolute right-4 flex items-center justify-center w-5 h-5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                      {pendingOrders > 9 ? "9+" : pendingOrders}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
