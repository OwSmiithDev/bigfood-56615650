import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany, useSubscription } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ChoosePlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { company, isLoading: companyLoading } = useCompany();
  const { data: subscription } = useSubscription(company?.id);
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: "free" as const,
      name: "Plano Free",
      price: 0,
      priceLabel: "Grátis",
      description: "Perfeito para começar",
      features: ["Até 5 produtos cadastrados", "Suporte por email", "Painel básico"],
      icon: Sparkles,
      popular: false,
    },
    {
      id: "premium" as const,
      name: "Plano Premium",
      price: 50,
      priceLabel: "R$ 50/mês",
      description: "Para negócios em crescimento",
      features: ["Até 10 produtos cadastrados", "Suporte prioritário", "Destaque no app", "Relatórios avançados"],
      icon: Crown,
      popular: true,
    },
  ];

  const handleSelectPlan = async (planId: "free" | "premium") => {
    setSelectedPlan(planId);
    
    if (planId === "free") {
      setIsLoading(true);
      try {
        // Update subscription to free plan with active status
        if (subscription?.id) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ 
              plan_id: "free", 
              status: "active",
              started_at: new Date().toISOString(),
            })
            .eq("id", subscription.id);
          
          if (error) throw error;
        }
        
        toast({
          title: "Plano Free ativado!",
          description: "Você pode cadastrar até 5 produtos.",
        });
        
        // Redirect to company settings/registration if company data is incomplete
        if (!company?.display_name || !company?.business_name) {
          navigate("/cadastrar-empresa");
        } else {
          navigate("/empresa/produtos");
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
    } else {
      // Premium plan - redirect to payment page
      navigate("/empresa/pagamento");
    }
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If subscription is already active, redirect to dashboard
  if (subscription?.status === "active") {
    navigate("/empresa");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h1>
          <p className="text-lg text-muted-foreground">
            Selecione o plano ideal para o seu negócio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan.id
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:border-primary/50"
                } ${plan.popular ? "border-primary" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {plan.priceLabel}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                  }}
                  disabled={isLoading}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <>
                      {plan.id === "free" ? "Começar Grátis" : "Escolher Premium"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlanPage;
