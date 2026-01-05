import { motion } from "framer-motion";
import { MapPin, ShoppingBag, MessageCircle, Check } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Encontre restaurantes",
    description: "Digite seu endereço e descubra os melhores restaurantes próximos a você",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShoppingBag,
    title: "Monte seu pedido",
    description: "Escolha seus pratos favoritos, personalize e adicione ao carrinho",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: MessageCircle,
    title: "Confirme via WhatsApp",
    description: "Seu pedido é enviado direto para o WhatsApp do restaurante",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Check,
    title: "Receba em casa",
    description: "Acompanhe e receba seu pedido fresquinho na sua porta",
    color: "bg-purple-500/10 text-purple-500",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pedir comida nunca foi tão fácil. Em poucos passos, seu pedido está a caminho!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Step Number */}
              <div className="relative z-10 mb-6">
                <div className={`w-20 h-20 mx-auto rounded-2xl ${step.color} flex items-center justify-center`}>
                  <step.icon className="w-9 h-9" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft">
                  {index + 1}
                </div>
              </div>

              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
