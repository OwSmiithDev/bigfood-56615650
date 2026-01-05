import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export interface SearchFilters {
  minRating: number | null;
  maxDeliveryFee: number | null;
  isOpen: boolean | null;
  freeDelivery: boolean;
  sortBy: "rating" | "delivery_fee" | "name" | null;
}

export const AdvancedSearch = ({ onSearch, searchTerm, onSearchTermChange }: AdvancedSearchProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    minRating: null,
    maxDeliveryFee: null,
    isOpen: null,
    freeDelivery: false,
    sortBy: null,
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      minRating: null,
      maxDeliveryFee: null,
      isOpen: null,
      freeDelivery: false,
      sortBy: null,
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  const hasActiveFilters = 
    filters.minRating !== null ||
    filters.maxDeliveryFee !== null ||
    filters.isOpen !== null ||
    filters.freeDelivery ||
    filters.sortBy !== null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar restaurantes, pratos..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative shrink-0"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Filtros</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {/* Rating filter */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Avaliação mínima</Label>
                <div className="flex gap-2">
                  {[3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange("minRating", filters.minRating === rating ? null : rating)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                        filters.minRating === rating
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange("isOpen", filters.isOpen === true ? null : true)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      filters.isOpen === true
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Abertos agora
                  </button>
                  <button
                    onClick={() => handleFilterChange("freeDelivery", !filters.freeDelivery)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      filters.freeDelivery
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Entrega grátis
                  </button>
                </div>
              </div>

              {/* Sort filter */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Ordenar por</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: "rating", label: "Melhor avaliação" },
                    { key: "delivery_fee", label: "Menor entrega" },
                    { key: "name", label: "Nome A-Z" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleFilterChange("sortBy", filters.sortBy === key ? null : key)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        filters.sortBy === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
