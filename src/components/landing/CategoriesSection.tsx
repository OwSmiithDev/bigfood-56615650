import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pizza, UtensilsCrossed, Coffee, Cake, Salad, Flame, Sandwich, IceCream, Soup, Beef, Grape, ChefHat } from "lucide-react";
import { RESTAURANT_CATEGORIES } from "@/constants/categories";

// Mapeamento de ícones para cada categoria
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Pizzaria": Pizza,
  "Hamburgueria": Flame,
  "Japonês": UtensilsCrossed,
  "Saudável": Salad,
  "Cafeteria": Coffee,
  "Doces": Cake,
  "Brasileira": Beef,
  "Italiana": ChefHat,
  "Mexicana": Soup,
  "Árabe": Sandwich,
  "Açaí": Grape,
  "Lanches": Sandwich,
};

// Cores para cada categoria
const categoryColors: Record<string, string> = {
  "Pizzaria": "bg-red-500/10 text-red-500",
  "Hamburgueria": "bg-orange-500/10 text-orange-500",
  "Japonês": "bg-pink-500/10 text-pink-500",
  "Saudável": "bg-green-500/10 text-green-500",
  "Cafeteria": "bg-amber-600/10 text-amber-600",
  "Doces": "bg-purple-500/10 text-purple-500",
  "Brasileira": "bg-yellow-600/10 text-yellow-600",
  "Italiana": "bg-emerald-500/10 text-emerald-500",
  "Mexicana": "bg-lime-500/10 text-lime-500",
  "Árabe": "bg-teal-500/10 text-teal-500",
  "Açaí": "bg-violet-500/10 text-violet-500",
  "Lanches": "bg-cyan-500/10 text-cyan-500",
};

// Exibir apenas 6 categorias principais na landing page
const displayCategories = RESTAURANT_CATEGORIES.slice(0, 6);

const CategoriesSection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    // Navega para a página de restaurantes com a categoria selecionada
    navigate(`/restaurantes?categoria=${encodeURIComponent(categoryId)}`);
  };

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
          {displayCategories.map((category, index) => {
            const Icon = categoryIcons[category.id] || UtensilsCrossed;
            const color = categoryColors[category.id] || "bg-gray-500/10 text-gray-500";
            
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background border border-border/50 shadow-card hover:shadow-hover transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="font-semibold text-foreground">{category.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
