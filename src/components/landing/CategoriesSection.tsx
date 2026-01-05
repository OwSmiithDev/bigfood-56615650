import { motion } from "framer-motion";
import { Pizza, UtensilsCrossed, Coffee, Cake, Salad, Flame } from "lucide-react";

const categories = [
  { icon: Pizza, name: "Pizzas", color: "bg-red-500/10 text-red-500" },
  { icon: UtensilsCrossed, name: "Japonês", color: "bg-pink-500/10 text-pink-500" },
  { icon: Flame, name: "Lanches", color: "bg-orange-500/10 text-orange-500" },
  { icon: Salad, name: "Saudável", color: "bg-green-500/10 text-green-500" },
  { icon: Coffee, name: "Cafeteria", color: "bg-amber-600/10 text-amber-600" },
  { icon: Cake, name: "Doces", color: "bg-purple-500/10 text-purple-500" },
];

const CategoriesSection = () => {
  return (
    <section id="categorias" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore por categorias
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre exatamente o que você está com vontade de comer
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background border border-border/50 shadow-card hover:shadow-hover transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <category.icon className="w-7 h-7" />
              </div>
              <span className="font-semibold text-foreground">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
