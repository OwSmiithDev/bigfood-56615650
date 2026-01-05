import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, ShoppingBag, Plus, Minus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, useProductCategories } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { isWithinOpeningHours, getNextOpeningTime, OpeningHours } from "@/utils/openingHours";

const RestaurantPage = () => {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addItem, items, total, itemCount, companyId, clearCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [showCart, setShowCart] = useState(false);

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    refetchInterval: 60000, // Refresh every minute to check is_open status
  });

  // Realtime updates for company status
  useEffect(() => {
    if (!id) return;
    
    const channel = supabase
      .channel(`restaurant-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "companies",
          filter: `id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const { data: products, isLoading: loadingProducts } = useProducts(id);
  const { data: categories } = useProductCategories(id);

  // Check if restaurant is actually open based on opening hours
  const isRestaurantOpen = restaurant?.is_open && isWithinOpeningHours(restaurant?.opening_hours);
  const nextOpeningTime = !isRestaurantOpen ? getNextOpeningTime(restaurant?.opening_hours) : null;

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.category_id === selectedCategory)
    : products;

  const handleAddToCart = () => {
    if (!selectedProduct || !restaurant) return;

    addItem(
      {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity,
        observation,
        image: selectedProduct.image_url,
      },
      restaurant.id,
      restaurant.display_name,
      restaurant.phone
    );

    toast({
      title: "Adicionado ao carrinho",
      description: `${quantity}x ${selectedProduct.name}`,
    });

    setSelectedProduct(null);
    setQuantity(1);
    setObservation("");
  };

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Restaurante não encontrado</p>
        <Link to="/home">
          <Button>Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative h-48 md:h-64 bg-gradient-primary">
        {restaurant.banner_url && (
          <img
            src={restaurant.banner_url}
            alt={restaurant.display_name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Link
          to="/home"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-start gap-4">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.display_name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {restaurant.display_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {restaurant.display_name}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {restaurant.category}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{restaurant.rating || "Novo"}</span>
                  <span className="text-muted-foreground">
                    ({restaurant.total_reviews || 0})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.estimated_delivery_time}</span>
                </div>
              </div>
            </div>
          </div>
          {restaurant.description && (
            <p className="text-muted-foreground text-sm mt-4">
              {restaurant.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {restaurant.street}, {restaurant.number} - {restaurant.neighborhood}
            </span>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="container mx-auto px-4 mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="container mx-auto px-4 mt-6">
        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-4 shadow-card flex gap-4 cursor-pointer hover:shadow-hover transition-shadow"
                onClick={() => {
                  setSelectedProduct(product);
                  setQuantity(1);
                  setObservation("");
                }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  {product.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                  <p className="text-primary font-bold mt-2">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum produto disponível
          </div>
        )}
      </div>

      {/* Cart Button */}
      {itemCount > 0 && companyId === id && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Ver carrinho ({itemCount}) • R$ {total.toFixed(2).replace(".", ",")}
          </Button>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50 flex items-end md:items-center justify-center"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-card w-full max-w-lg rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {selectedProduct.name}
                </h2>
                {selectedProduct.description && (
                  <p className="text-muted-foreground mt-2">
                    {selectedProduct.description}
                  </p>
                )}
                <p className="text-primary text-xl font-bold mt-4">
                  R$ {selectedProduct.price.toFixed(2).replace(".", ",")}
                </p>

                <div className="mt-6">
                  <label className="text-sm font-medium text-foreground">
                    Observações
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Ex: Sem cebola, ponto da carne..."
                    className="w-full mt-2 p-3 rounded-lg border border-border bg-background text-foreground resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <Button variant="hero" size="lg" onClick={handleAddToCart}>
                    Adicionar R${" "}
                    {(selectedProduct.price * quantity).toFixed(2).replace(".", ",")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-card w-full max-w-lg rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Seu Carrinho
                  </h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        <p className="text-primary font-semibold">
                          R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.quantity}x</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Closed store warning */}
                {!isRestaurantOpen && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">
                          Esta empresa está fechada no momento e não aceita pedidos.
                        </p>
                        {nextOpeningTime && (
                          <p className="text-sm text-muted-foreground mt-1">
                            A loja abrirá {nextOpeningTime.includes("às") ? "" : "às "}{nextOpeningTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-border mt-6 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {isRestaurantOpen ? (
                    <Link to="/checkout">
                      <Button variant="hero" size="lg" className="w-full">
                        Finalizar pedido
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="hero" size="lg" className="w-full" disabled>
                      Loja fechada
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      clearCart();
                      setShowCart(false);
                    }}
                  >
                    Limpar carrinho
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantPage;
