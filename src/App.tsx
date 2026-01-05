import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CustomerHome from "./pages/CustomerHome";
import OrderHistory from "./pages/customer/OrderHistory";
import RestaurantPage from "./pages/RestaurantPage";
import CheckoutPage from "./pages/CheckoutPage";
import RegisterCompanyPage from "./pages/RegisterCompanyPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminConfig from "./pages/admin/AdminConfig";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProducts from "./pages/company/CompanyProducts";
import CompanyOrders from "./pages/company/CompanyOrders";
import CompanyReviews from "./pages/company/CompanyReviews";
import CompanySettings from "./pages/company/CompanySettings";
import ChoosePlanPage from "./pages/company/ChoosePlanPage";
import PaymentPage from "./pages/company/PaymentPage";
import ManagePlanPage from "./pages/company/ManagePlanPage";
import RenewPlanPage from "./pages/company/RenewPlanPage";
import CompanyNotifications from "./pages/company/CompanyNotifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  
  return <>{children}</>;
};

const ProtectedCompanyRoute = ({ children, allowExpired = false }: { children: React.ReactNode; allowExpired?: boolean }) => {
  const { user, loading, isCompany } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isCompany) return <Navigate to="/home" replace />;
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/home" element={<CustomerHome />} />
              <Route path="/restaurantes" element={<CustomerHome />} />
              <Route path="/meus-pedidos" element={<OrderHistory />} />
              <Route path="/restaurante/:id" element={<RestaurantPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/cadastrar-empresa" element={<RegisterCompanyPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/empresas" element={<ProtectedAdminRoute><AdminCompanies /></ProtectedAdminRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
              <Route path="/admin/pedidos" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
              <Route path="/admin/cupons" element={<ProtectedAdminRoute><AdminCoupons /></ProtectedAdminRoute>} />
              <Route path="/admin/config" element={<AdminConfig />} />
              
              {/* Company Routes */}
              <Route path="/empresa" element={<ProtectedCompanyRoute><CompanyDashboard /></ProtectedCompanyRoute>} />
              <Route path="/empresa/planos" element={<ProtectedCompanyRoute><ChoosePlanPage /></ProtectedCompanyRoute>} />
              <Route path="/empresa/pagamento" element={<ProtectedCompanyRoute><PaymentPage /></ProtectedCompanyRoute>} />
              <Route path="/empresa/gerenciar-plano" element={<ProtectedCompanyRoute><ManagePlanPage /></ProtectedCompanyRoute>} />
              <Route path="/empresa/renovar" element={<ProtectedCompanyRoute><RenewPlanPage /></ProtectedCompanyRoute>} />
              <Route path="/empresa/produtos" element={<ProtectedCompanyRoute><CompanyProducts /></ProtectedCompanyRoute>} />
              <Route path="/empresa/pedidos" element={<ProtectedCompanyRoute><CompanyOrders /></ProtectedCompanyRoute>} />
              <Route path="/empresa/notificacoes" element={<ProtectedCompanyRoute><CompanyNotifications /></ProtectedCompanyRoute>} />
              <Route path="/empresa/avaliacoes" element={<ProtectedCompanyRoute><CompanyReviews /></ProtectedCompanyRoute>} />
              <Route path="/empresa/config" element={<ProtectedCompanyRoute><CompanySettings /></ProtectedCompanyRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
