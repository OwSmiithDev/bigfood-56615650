import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, QrCode, Crown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany, useSubscription } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type PaymentMethod = "pix" | "card";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { company } = useCompany();
  const { data: subscription } = useSubscription(company?.id);
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get user profile for name
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const paymentMethods = [
    {
      id: "pix" as const,
      name: "Pix",
      description: "Pagamento instantâneo",
      icon: QrCode,
    },
    {
      id: "card" as const,
      name: "Cartão",
      description: "Crédito ou débito",
      icon: CreditCard,
    },
  ];

  const handleActivatePlan = async () => {
    if (!paymentMethod) {
      toast({
        title: "Selecione a forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update subscription to premium with pending status
      if (subscription?.id) {
        const { error } = await supabase
          .from("subscriptions")
          .update({ 
            plan_id: "premium", 
            status: "pending",
            notes: `Forma de pagamento: ${paymentMethod === "pix" ? "PIX" : "Cartão"}`,
          })
          .eq("id", subscription.id);
        
        if (error) throw error;
      }

      // Build WhatsApp message
      const responsibleName = profile?.name || user?.email?.split("@")[0] || "Não informado";
      const companyName = company?.display_name || company?.business_name || "Não informado";
      const paymentLabel = paymentMethod === "pix" ? "PIX" : "CARTÃO";

      const message = encodeURIComponent(
        `Olá, quero fazer a ativação do meu plano por 50 reais por mês.\n\n` +
        `Forma de pagamento: ${paymentLabel}\n` +
        `Meu nome é: ${responsibleName}\n` +
        `Dono da empresa: ${companyName}`
      );

      const whatsappNumber = "5562999718912";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

      toast({
        title: "Redirecionando para WhatsApp",
        description: "Finalize sua ativação com o administrador.",
      });

      // Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");

      // Redirect to company settings if data is incomplete
      if (!company?.display_name || !company?.business_name) {
        navigate("/cadastrar-empresa");
      } else {
        navigate("/empresa");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/empresa/planos" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-lg font-bold">Pagamento</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Plan Summary */}
          <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Plano Premium</h2>
                <p className="text-muted-foreground">Até 10 produtos • Suporte prioritário</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total mensal</span>
                <span className="font-display text-2xl font-bold text-primary">R$ 50,00</span>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div className="mb-8">
            <h3 className="font-display text-lg font-semibold mb-4">Forma de pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`p-4 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
                      paymentMethod === method.id ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <method.icon className={`w-6 h-6 ${
                        paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <h4 className="font-semibold">{method.name}</h4>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <Card className="p-4 mb-6 bg-muted/50">
            <div className="flex gap-3">
              <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Como funciona?</h4>
                <p className="text-sm text-muted-foreground">
                  Ao clicar em "Ativar Plano", você será redirecionado para o WhatsApp do administrador 
                  para finalizar o pagamento. Após confirmação, seu plano será ativado.
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleActivatePlan}
            disabled={!paymentMethod || isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2" />
                Ativar Plano via WhatsApp
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
