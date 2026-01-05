import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Check, MessageCircle, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCompany, useSubscription } from "@/hooks/useCompany";
import { useProducts } from "@/hooks/useProducts";
import { PLANS, getPlanById, getProductLimit } from "@/constants/plans";

const ADMIN_WHATSAPP = "5511999999999"; // Número do admin configurado

const RenewPlanPage = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { data: subscription } = useSubscription(company?.id);
  const { data: products } = useProducts(company?.id);

  const activeProductsCount = products?.filter(p => p.available)?.length || 0;
  const freeLimit = getProductLimit("free") || 5;
  const canDowngradeToFree = activeProductsCount <= freeLimit;

  // Only show paid plans
  const paidPlans = PLANS.filter(p => p.id !== "free");

  const handleRenewPlan = (planId: string) => {
    const plan = getPlanById(planId);
    if (!plan) return;

    const message = encodeURIComponent(
      `Olá, gostaria de RENOVAR meu plano.\n\n` +
      `🎯 Plano desejado: ${plan.name}\n` +
      `💰 Valor: ${plan.priceLabel}\n` +
      `🏪 Empresa: ${company?.display_name || "N/A"}\n` +
      `👤 Responsável: ${company?.business_name || "N/A"}`
    );

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, "_blank");
  };

  const handleDowngradeToFree = () => {
    const message = encodeURIComponent(
      `Olá, gostaria de VOLTAR AO PLANO GRÁTIS.\n\n` +
      `🏪 Empresa: ${company?.display_name || "N/A"}\n` +
      `👤 Responsável: ${company?.business_name || "N/A"}\n` +
      `📦 Produtos ativos: ${activeProductsCount}`
    );

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 mb-6">
            <Crown className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Vamos abrir novamente a sua loja?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Seu plano expirou, mas não se preocupe! Escolha um plano abaixo para reativar sua loja e voltar a receber pedidos.
          </p>
        </motion.div>

        {/* Paid Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {paidPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative p-6 h-full flex flex-col hover:shadow-lg transition-all ${
                  plan.recommended ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Recomendado
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.recommended ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.recommended ? "text-primary" : "text-muted-foreground"}`} />
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

                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.recommended ? "hero" : "outline"}
                  size="lg"
                  className="w-full mt-auto"
                  onClick={() => handleRenewPlan(plan.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Renovar com {plan.name.replace("Plano ", "")}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Downgrade to Free Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`p-6 ${!canDowngradeToFree ? "opacity-60" : ""}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">Voltar ao Plano Grátis</h3>
                  <p className="text-sm text-muted-foreground">
                    Limite de até 5 produtos
                  </p>
                  {!canDowngradeToFree && (
                    <div className="flex items-center gap-2 mt-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">
                        Você tem {activeProductsCount} produtos ativos. Reduza para 5 ou menos para voltar ao plano grátis.
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDowngradeToFree}
                disabled={!canDowngradeToFree}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Solicitar Plano Grátis
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Ao escolher um plano, você será redirecionado para o WhatsApp do administrador.
          </p>
          <p className="mt-1">
            Sua loja será reativada assim que o pagamento for confirmado.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RenewPlanPage;
