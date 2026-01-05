import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Clock, LogOut, User, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useAuth } from "@/contexts/AuthContext";
import { AdvancedSearch, SearchFilters } from "@/components/AdvancedSearch";

const categories = [
  { id: "all", name: "Todos", emoji: "🍽️" },
  { id: "Hambúrguer", name: "Hambúrguer", emoji: "🍔" },
  { id: "Pizza", name: "Pizza", emoji: "🍕" },
  { id: "Japonesa", name: "Japonesa", emoji: "🍣" },
  { id: "Brasileira", name: "Brasileira", emoji: "🍖" },
  { id: "Açaí", name: "Açaí", emoji: "🍇" },
  { id: "Doces", name: "Doces", emoji: "🍰" },
];

const CustomerHome = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState<SearchFilters>({
    minRating: null,
    maxDeliveryFee: null,
    isOpen: null,
    freeDelivery: false,
    sortBy: null,
  });
  
  const { data: restaurants, isLoading } = useRestaurants(selectedCategory, searchTerm);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const filteredAndSortedRestaurants = useMemo(() => {
    if (!restaurants) return [];

    let result = [...restaurants];

    // Apply filters
    if (filters.minRating !== null) {
      result = result.filter((r) => Number(r.rating || 0) >= filters.minRating!);
    }

    if (filters.isOpen === true) {
      result = result.filter((r) => r.is_open);
    }

    if (filters.freeDelivery) {
      result = result.filter((r) => Number(r.delivery_fee || 0) === 0);
    }

    if (filters.maxDeliveryFee !== null) {
      result = result.filter((r) => Number(r.delivery_fee || 0) <= filters.maxDeliveryFee!);
    }

    // Apply sorting
    if (filters.sortBy === "rating") {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (filters.sortBy === "delivery_fee") {
      result.sort((a, b) => Number(a.delivery_fee || 0) - Number(b.delivery_fee || 0));
    } else if (filters.sortBy === "name") {
      result.sort((a, b) => a.display_name.localeCompare(b.display_name));
    }

    return result;
  }, [restaurants, filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-xl text-primary-foreground">B</span>
              </div>
              <span className="font-display font-bold text-xl hidden sm:block">BigFood</span>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <MapPin className="w-5 h-5" />
              </Button>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/meus-pedidos">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/meus-pedidos">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="hero" size="sm">Entrar</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Advanced Search */}
        <div className="mb-6">
          <AdvancedSearch
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSearch={setFilters}
          />
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredAndSortedRestaurants.length} restaurante(s) encontrado(s)
          </p>
        )}

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-2xl animate-pulse" />
            ))
          ) : filteredAndSortedRestaurants.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
            </div>
          ) : (
            filteredAndSortedRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/restaurante/${restaurant.id}`}
                  className="block group"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-3">
                    {restaurant.banner_url ? (
                      <img
                        src={restaurant.banner_url}
                        alt={restaurant.display_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    {restaurant.is_open ? (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Aberto
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                        Fechado
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {restaurant.display_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{restaurant.category}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {Number(restaurant.rating || 0).toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {restaurant.estimated_delivery_time}
                    </span>
                    <span className="text-muted-foreground">
                      {Number(restaurant.delivery_fee) === 0 
                        ? "Entrega grátis" 
                        : `R$ ${Number(restaurant.delivery_fee).toFixed(2)}`}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerHome;
