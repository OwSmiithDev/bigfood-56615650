import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, ArrowUp, ArrowDown, Check, MessageCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCompany, useSubscription } from "@/hooks/useCompany";
import { useProducts } from "@/hooks/useProducts";
import { PLANS, getPlanById, getProductLimit } from "@/constants/plans";
import { useToast } from "@/hooks/use-toast";

const ADMIN_WHATSAPP = "5511999999999"; // Número do admin configurado

const ManagePlanPage = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { data: subscription } = useSubscription(company?.id);
  const { data: products } = useProducts(company?.id);
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlanId = subscription?.plan_id || "free";
  const currentPlan = getPlanById(currentPlanId);
  const activeProductsCount = products?.filter(p => p.available)?.length || 0;

  const handlePlanRequest = (targetPlanId: string) => {
    const targetPlan = getPlanById(targetPlanId);
    if (!targetPlan || !currentPlan) return;

    const isUpgrade = PLANS.findIndex(p => p.id === targetPlanId) > PLANS.findIndex(p => p.id === currentPlanId);
    const action = isUpgrade ? "UPGRADE" : "DOWNGRADE";

    // Check downgrade rules for free plan
    if (targetPlanId === "free") {
      const freeLimit = getProductLimit("free") || 5;
      if (activeProductsCount > freeLimit) {
        toast({
          title: "Não é possível voltar ao plano grátis",
          description: `Para voltar ao plano grátis, é necessário excluir ou desativar produtos até atingir o limite de ${freeLimit} produtos. Você tem ${activeProductsCount} produtos ativos.`,
          variant: "destructive",
        });
        return;
      }
    }

    const message = encodeURIComponent(
      `Olá, gostaria de solicitar um ${action} do meu plano.\n\n` +
      `📋 Plano atual: ${currentPlan.name}\n` +
      `🎯 Plano desejado: ${targetPlan.name}\n` +
      `🏪 Empresa: ${company?.display_name || "N/A"}\n` +
      `👤 Responsável: ${company?.business_name || "N/A"}`
    );

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, "_blank");
  };

  const getPlanStatus = (planId: string) => {
    if (planId === currentPlanId) return "current";
    const currentIndex = PLANS.findIndex(p => p.id === currentPlanId);
    const targetIndex = PLANS.findIndex(p => p.id === planId);
    return targetIndex > currentIndex ? "upgrade" : "downgrade";
  };

  const canDowngradeToFree = () => {
    const freeLimit = getProductLimit("free") || 5;
    return activeProductsCount <= freeLimit;
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/empresa")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-4">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Gerenciar Plano
            </h1>
            <p className="text-lg text-muted-foreground">
              Seu plano atual: <span className="font-semibold text-primary">{currentPlan?.name}</span>
            </p>
            {currentPlan?.maxProducts && (
              <p className="text-sm text-muted-foreground mt-2">
                Produtos: {activeProductsCount} / {currentPlan.maxProducts}
              </p>
            )}
          </div>
        </motion.div>

        {/* Downgrade warning */}
        {currentPlanId !== "free" && !canDowngradeToFree() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 border-yellow-500/50 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Limite de produtos excedido</p>
                  <p className="text-sm text-muted-foreground">
                    Para voltar ao plano grátis, é necessário excluir ou desativar produtos até atingir o limite de 5.
                    Você tem atualmente {activeProductsCount} produtos ativos.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate("/empresa/produtos")}
                  >
                    Gerenciar Produtos
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, index) => {
            const status = getPlanStatus(plan.id);
            const isDisabled = plan.id === "free" && !canDowngradeToFree() && status === "downgrade";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative p-6 h-full flex flex-col transition-all ${
                    status === "current"
                      ? "ring-2 ring-primary shadow-lg"
                      : isDisabled
                      ? "opacity-50"
                      : "hover:shadow-lg hover:border-primary/50"
                  }`}
                >
                  {status === "current" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Plano Atual
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      status === "current" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <plan.icon className={`w-6 h-6 ${status === "current" ? "text-primary" : "text-muted-foreground"}`} />
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

                  {status === "current" ? (
                    <Button variant="outline" disabled className="w-full mt-auto">
                      <Check className="w-4 h-4 mr-2" />
                      Plano Ativo
                    </Button>
                  ) : (
                    <Button
                      variant={status === "upgrade" ? "hero" : "outline"}
                      className="w-full mt-auto"
                      onClick={() => handlePlanRequest(plan.id)}
                      disabled={isDisabled}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {status === "upgrade" ? (
                        <>
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Solicitar Upgrade
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-4 h-4 mr-1" />
                          Solicitar Downgrade
                        </>
                      )}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Ao solicitar alteração de plano, você será redirecionado para o WhatsApp do administrador.
          </p>
          <p className="mt-1">
            A alteração será processada em até 24 horas úteis.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagePlanPage;
