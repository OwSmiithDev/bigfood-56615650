import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Menu,
  ArrowUpCircle,
  Power,
  AlertTriangle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany, useSubscription } from "@/hooks/useCompany";
import {
  useProducts,
  useProductCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { CompanySidebar } from "@/components/company/CompanySidebar";
import { ImageUpload } from "@/components/ImageUpload";
import { getProductLimit, canAddMoreProducts, getPlanById } from "@/constants/plans";

const CompanyProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { company } = useCompany();
  const { data: subscription } = useSubscription(company?.id);
  const { data: products, isLoading } = useProducts(company?.id);
  const { data: categories } = useProductCategories(company?.id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  // Get product limit from plan using constants
  const isSubscriptionActive = subscription?.status === "active";
  const planId = subscription?.plan_id || "free";
  const currentPlan = getPlanById(planId);
  const maxProducts = currentPlan?.maxProducts;
  const currentProductCount = products?.length || 0;
  const canAddProduct = isSubscriptionActive && canAddMoreProducts(planId, currentProductCount);
  const isAtLimit = maxProducts !== null && currentProductCount >= maxProducts;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    available: true,
    stock_quantity: "",
    min_stock: "",
  });

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category_id: product.category_id || "",
        image_url: product.image_url || "",
        available: product.available ?? true,
        stock_quantity: product.stock_quantity?.toString() || "",
        min_stock: product.min_stock?.toString() || "",
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: "",
        available: true,
        stock_quantity: "",
        min_stock: "",
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!company) return;

    // Check if subscription is active
    if (!isSubscriptionActive) {
      toast({
        title: "Plano não ativado",
        description: "Aguarde a aprovação do seu plano para adicionar produtos.",
        variant: "destructive",
      });
      return;
    }

    // Check product limit for new products
    if (!editingProduct && !canAddProduct) {
      toast({
        title: "Limite de produtos atingido",
        description: `Seu plano permite apenas ${maxProducts} produtos. Faça upgrade para adicionar mais.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const stockQty = productForm.stock_quantity ? parseInt(productForm.stock_quantity) : null;
      const minStock = productForm.min_stock ? parseInt(productForm.min_stock) : null;
      
      // Auto-disable if stock is 0
      const isAvailable = stockQty !== null && stockQty <= 0 ? false : productForm.available;
      
      const data = {
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        category_id: productForm.category_id || null,
        image_url: productForm.image_url || null,
        company_id: company.id,
        available: isAvailable,
        stock_quantity: stockQty,
        min_stock: minStock,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
        toast({ title: "Produto atualizado!" });
      } else {
        await createProduct.mutateAsync(data);
        toast({ title: "Produto criado!" });
      }
      setShowProductModal(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleAvailable = async (product: any) => {
    try {
      // Don't allow enabling if stock is 0
      if (!product.available && product.stock_quantity !== null && product.stock_quantity <= 0) {
        toast({
          title: "Estoque zerado",
          description: "Adicione estoque antes de ativar o produto.",
          variant: "destructive",
        });
        return;
      }
      
      await updateProduct.mutateAsync({
        id: product.id,
        available: !product.available,
      });
      toast({
        title: product.available ? "Produto desativado" : "Produto ativado",
      });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast({ title: "Produto excluído!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveCategory = async () => {
    if (!company) return;
    try {
      await createCategory.mutateAsync({
        name: categoryForm.name,
        description: categoryForm.description || null,
        company_id: company.id,
      });
      toast({ title: "Categoria criada!" });
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background flex">
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        <header className="sticky top-0 z-30 bg-card border-b border-border shrink-0">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 shrink-0"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h1 className="font-display text-lg sm:text-xl font-bold text-foreground truncate">
                Produtos
              </h1>
            </div>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCategoryModal(true)}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Categoria</span>
              </Button>
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => openProductModal()}
                disabled={!canAddProduct}
                title={!canAddProduct ? `Limite de ${maxProducts ?? "?"} produtos atingido` : undefined}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Produto</span>
                {maxProducts !== null && (
                  <span className="ml-1 text-xs opacity-80">
                    ({currentProductCount}/{maxProducts})
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          {/* Upgrade Banner when at limit */}
          {isAtLimit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <ArrowUpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Limite de produtos atingido</p>
                  <p className="text-xs text-muted-foreground">
                    Seu plano {currentPlan?.name} permite até {maxProducts} produtos. Faça upgrade para adicionar mais.
                  </p>
                </div>
              </div>
              <Link to="/empresa/planos">
                <Button variant="hero" size="sm" className="whitespace-nowrap">
                  Fazer upgrade
                </Button>
              </Link>
            </motion.div>
          )}
          {/* Categories Filter */}
          {categories && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-6 scrollbar-hide -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock_quantity !== null && 
                  product.min_stock !== null && 
                  product.stock_quantity <= product.min_stock && 
                  product.stock_quantity > 0;
                const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0;
                
                return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-card rounded-xl overflow-hidden shadow-card relative ${!product.available ? 'opacity-60' : ''}`}
                >
                  {/* Status badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {!product.available && (
                      <span className="px-2 py-0.5 bg-muted/90 text-muted-foreground text-xs rounded-full font-medium">
                        Desativado
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="px-2 py-0.5 bg-destructive/90 text-destructive-foreground text-xs rounded-full font-medium">
                        Sem estoque
                      </span>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <span className="px-2 py-0.5 bg-orange-500/90 text-white text-xs rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Estoque baixo
                      </span>
                    )}
                  </div>
                  
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-32 sm:h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 sm:h-40 bg-muted flex items-center justify-center">
                      <Package className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {product.name}
                        </h3>
                        <p className="text-primary font-bold mt-1 text-sm sm:text-base">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                        {product.stock_quantity !== null && (
                          <p className={`text-xs mt-1 ${isOutOfStock ? 'text-destructive' : isLowStock ? 'text-orange-500' : 'text-muted-foreground'}`}>
                            Estoque: {product.stock_quantity} un.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Switch
                          checked={product.available}
                          onCheckedChange={() => handleToggleAvailable(product)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => openProductModal(product)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-muted"
                          >
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Nenhum produto cadastrado</p>
              <Button
                variant="hero"
                className="mt-4"
                size="sm"
                onClick={() => openProductModal()}
              >
                Adicionar primeiro produto
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="font-display text-lg sm:text-xl font-bold">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm">Nome</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Descrição</Label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full mt-1 p-3 rounded-lg border border-border bg-background text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-sm">Preço</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, price: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Categoria</Label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, category_id: e.target.value }))
                    }
                    className="w-full mt-1 p-3 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="">Sem categoria</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm">Imagem do Produto</Label>
                  <div className="mt-1">
                    <ImageUpload
                      value={productForm.image_url}
                      onChange={(url) => setProductForm((p) => ({ ...p, image_url: url }))}
                      folder="products"
                    />
                  </div>
                </div>

                {/* Stock Control Section */}
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Controle de Estoque
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Quantidade em Estoque</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ilimitado"
                        value={productForm.stock_quantity}
                        onChange={(e) =>
                          setProductForm((p) => ({ ...p, stock_quantity: e.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Estoque Mínimo</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Opcional"
                        value={productForm.min_stock}
                        onChange={(e) =>
                          setProductForm((p) => ({ ...p, min_stock: e.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Deixe em branco para estoque ilimitado. O produto será desativado automaticamente quando o estoque chegar a 0.
                  </p>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Produto Disponível</Label>
                    <p className="text-xs text-muted-foreground">
                      Produtos desativados não aparecem para clientes
                    </p>
                  </div>
                  <Switch
                    checked={productForm.available}
                    onCheckedChange={(checked) =>
                      setProductForm((p) => ({ ...p, available: checked }))
                    }
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancelar
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleSaveProduct}>
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="font-display text-lg sm:text-xl font-bold">Nova Categoria</h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm">Nome</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Descrição (opcional)</Label>
                  <Input
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, description: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handleSaveCategory}
                >
                  Criar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyProducts;