import { motion } from "framer-motion";
import { Star, Clock, MapPin } from "lucide-react";
import foodPizza from "@/assets/food-pizza.png";
import foodPoke from "@/assets/food-poke.png";
import foodSushi from "@/assets/food-sushi.png";

const restaurants = [
  {
    id: 1,
    name: "Pizzaria Napolitana",
    image: foodPizza,
    category: "Pizzas",
    rating: 4.8,
    reviews: 324,
    deliveryTime: "30-40",
    deliveryFee: "R$ 5,99",
    distance: "1.2 km",
  },
  {
    id: 2,
    name: "Poke House",
    image: foodPoke,
    category: "Saudável",
    rating: 4.9,
    reviews: 189,
    deliveryTime: "25-35",
    deliveryFee: "Grátis",
    distance: "0.8 km",
  },
  {
    id: 3,
    name: "Sushi Master",
    image: foodSushi,
    category: "Japonês",
    rating: 4.7,
    reviews: 456,
    deliveryTime: "40-50",
    deliveryFee: "R$ 7,99",
    distance: "2.1 km",
  },
];

const FeaturedRestaurants = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Restaurantes em destaque
            </h2>
            <p className="text-muted-foreground text-lg">
              Os mais pedidos na sua região
            </p>
          </div>
          <button className="text-primary font-semibold hover:underline">
            Ver todos →
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-sm font-medium text-foreground">
                    {restaurant.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    restaurant.deliveryFee === "Grátis" 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-card/90 backdrop-blur-sm text-foreground"
                  }`}>
                    {restaurant.deliveryFee}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {restaurant.name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="font-semibold text-foreground">{restaurant.rating}</span>
                    <span>({restaurant.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.distance}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-foreground font-medium">{restaurant.deliveryTime} min</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurants;
