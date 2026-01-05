import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Ticket
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Building2, label: "Empresas", path: "/admin/empresas" },
  { icon: Users, label: "Usuários", path: "/admin/usuarios" },
  { icon: ShoppingBag, label: "Pedidos", path: "/admin/pedidos" },
  { icon: Ticket, label: "Cupons", path: "/admin/cupons" },
  { icon: Settings, label: "Configurações", path: "/admin/config" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static top-0 left-0 h-full lg:h-auto w-64 bg-card border-r border-border z-50 transition-transform duration-300 shrink-0",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2">
                <Logo size="sm" showText={false} />
                <div>
                  <span className="font-display font-bold text-base sm:text-lg block">BigFood</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Admin</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 sm:p-6 border-t border-border shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground text-sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border shrink-0">
          <div className="flex items-center justify-between h-14 px-3 sm:px-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Logo size="sm" showText={false} />
              <span className="font-display font-bold text-base sm:text-lg">BigFood</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 lg:mb-8"
          >
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">{subtitle}</p>
            )}
          </motion.div>

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};