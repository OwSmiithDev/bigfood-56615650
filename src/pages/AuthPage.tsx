import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Phone, Store, ArrowLeft, Eye, EyeOff } from "lucide-react";
import authBackground from "@/assets/auth-background.png";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type UserType = "user" | "company";
type AuthTab = "login" | "register";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, user, loading, isAdmin, isCompany } = useAuth();

  // Get the redirect path from state (e.g., from checkout)
  const from = (location.state as { from?: string })?.from;

  const [activeTab, setActiveTab] = useState<AuthTab>(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [userType, setUserType] = useState<UserType>(
    searchParams.get("type") === "company" ? "company" : "user"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!user || loading) return;

      // If there's a redirect path from state, go there
      if (from) {
        navigate(from);
        return;
      }

      if (isAdmin) {
        navigate("/admin");
        return;
      }

      if (isCompany) {
        // Check if company has a subscription and if it's active
        const { data: company } = await supabase
          .from("companies")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (company) {
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("company_id", company.id)
            .maybeSingle();

          // If pending or no subscription, go to plan selection
          if (!subscription || subscription.status === "pending") {
            navigate("/empresa/planos");
            return;
          }
        }

        navigate("/empresa");
        return;
      }

      navigate("/home");
    };

    checkAndRedirect();
  }, [user, loading, isAdmin, isCompany, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Login realizado!", description: "Bem-vindo de volta!" });
      } else {
        const { error } = await signUp(email, password, { 
          name, 
          phone, 
          user_type: userType, 
          business_name: businessName 
        });
        if (error) throw error;

        // If registering as company, create the company record after signup
        if (userType === "company") {
          // Wait a moment for the user to be created
          const { data: { user: newUser } } = await supabase.auth.getUser();
          
          if (newUser) {
            // Create company record
            const { error: companyError } = await supabase
              .from("companies")
              .insert({
                user_id: newUser.id,
                business_name: businessName || name,
                display_name: businessName || name,
                phone: phone || null,
                email: email,
              });

            if (companyError) {
              console.error("Error creating company:", companyError);
            }
          }
        }

        toast({ title: "Conta criada!", description: "Sua conta foi criada com sucesso." });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={authBackground} 
          alt="Fundo com pratos de comida" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <Logo size="lg" textClassName="text-white" className="mb-12" />
          <h1 className="font-display text-4xl font-bold mb-4 drop-shadow-lg">
            {userType === "company" ? "Leve seu negócio para o próximo nível" : "Descubra os melhores sabores"}
          </h1>
          <p className="text-lg opacity-90 drop-shadow-md">
            {userType === "company" ? "Gerencie seu restaurante e cresça suas vendas." : "Encontre restaurantes incríveis perto de você."}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">Voltar</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {activeTab === "login" ? "Bem-vindo de volta" : "Criar conta"}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "login" ? "Entre com suas credenciais" : "Preencha os dados para começar"}
            </p>
          </div>

          {activeTab === "register" && (
            <div className="mb-6">
              <div className="flex p-1 bg-muted rounded-xl">
                <button type="button" onClick={() => setUserType("user")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${userType === "user" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                  <User className="w-4 h-4" /> Cliente
                </button>
                <button type="button" onClick={() => setUserType("company")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${userType === "company" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                  <Store className="w-4 h-4" /> Empresa
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {activeTab === "register" && (
                <motion.div key="register-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="name" type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  {userType === "company" && (
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Nome do estabelecimento</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input id="businessName" type="text" placeholder="Ex: Pizzaria do João" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="pl-10" required />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="phone" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : activeTab === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            {activeTab === "login" ? (
              <>Não tem conta? <button type="button" onClick={() => setActiveTab("register")} className="text-primary font-semibold hover:underline">Cadastre-se</button></>
            ) : (
              <>Já tem conta? <button type="button" onClick={() => setActiveTab("login")} className="text-primary font-semibold hover:underline">Entrar</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
