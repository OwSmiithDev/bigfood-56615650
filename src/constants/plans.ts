import { Sparkles, Crown, Zap } from "lucide-react";

export interface Plan {
  id: "free" | "premium" | "professional";
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  maxProducts: number | null; // null = unlimited
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
  recommended: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Plano Grátis",
    price: 0,
    priceLabel: "Grátis",
    description: "Perfeito para começar",
    features: [
      "Até 5 produtos cadastrados",
      "Pedidos via WhatsApp",
      "Painel básico",
    ],
    maxProducts: 5,
    icon: Sparkles,
    popular: true,
    recommended: false,
  },
  {
    id: "premium",
    name: "Plano Premium",
    price: 50,
    priceLabel: "R$ 50/mês",
    description: "Para negócios em crescimento",
    features: [
      "Até 10 produtos cadastrados",
      "Suporte prioritário",
      "Destaque no app",
      "Relatórios básicos",
    ],
    maxProducts: 10,
    icon: Crown,
    popular: false,
    recommended: false,
  },
  {
    id: "professional",
    name: "Plano Profissional",
    price: 99.90,
    priceLabel: "R$ 99,90/mês",
    description: "Para quem quer crescer sem limites",
    features: [
      "Produtos ilimitados",
      "Automação com n8n",
      "Prioridade na busca",
      "Relatórios avançados de vendas",
    ],
    maxProducts: null, // unlimited
    icon: Zap,
    popular: false,
    recommended: true,
  },
];

export const getPlanById = (planId: string): Plan | undefined => {
  return PLANS.find((plan) => plan.id === planId);
};

export const getProductLimit = (planId: string): number | null => {
  const plan = getPlanById(planId);
  return plan?.maxProducts ?? 5; // Default to 5 if plan not found
};

export const canAddMoreProducts = (planId: string, currentProductCount: number): boolean => {
  const limit = getProductLimit(planId);
  if (limit === null) return true; // Unlimited
  return currentProductCount < limit;
};
