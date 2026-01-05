import { motion } from "framer-motion";
import { Store, BarChart3, MessageSquare, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PLANS } from "@/constants/plans";

const features = [
  {
    icon: Store,
    title: "Painel completo",
    description: "Gerencie cardápio, pedidos e configurações em um só lugar",
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    description: "Acompanhe vendas e desempenho do seu negócio",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp integrado",
    description: "Receba pedidos diretamente no seu WhatsApp",
  },
  {
    icon: Settings,
    title: "Automações",
    description: "Confirme pedidos automaticamente com n8n (Plano Profissional)",
  },
];

const ForBusinessSection = () => {
  const freePlan = PLANS.find(p => p.id === "free")!;
  const premiumPlan = PLANS.find(p => p.id === "premium")!;
  const professionalPlan = PLANS.find(p => p.id === "professional")!;

  return (
    <section id="empresas" className="py-20 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              Para restaurantes
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Leve seu restaurante para o <span className="text-gradient">próximo nível</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Cadastre seu negócio gratuitamente e comece a receber pedidos em minutos.
              Gerencie tudo de forma simples e profissional.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                    <p className="text-muted-foreground text-xs mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to="/auth?tab=register&type=company">
              <Button variant="hero" size="lg" className="gap-2">
                Cadastrar minha empresa
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Right Content - Pricing Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Free Plan */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-foreground">{freePlan.name}</h3>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  Popular
                </span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {freePlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-foreground">{premiumPlan.name}</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 50</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {premiumPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Professional Plan */}
            <div className="p-6 rounded-2xl bg-gradient-card border-2 border-primary shadow-hover relative">
              <div className="absolute -top-3 left-6">
                <span className="px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">
                  Recomendado
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 pt-2">
                <h3 className="font-display font-bold text-xl text-foreground">{professionalPlan.name}</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">R$ 99,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {professionalPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default ForBusinessSection;
