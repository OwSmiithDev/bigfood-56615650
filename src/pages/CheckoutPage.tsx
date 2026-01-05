import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, User, Phone, MessageCircle, ShoppingBag, Ticket, X, Check, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { useValidateCoupon, useIncrementCouponUsage } from "@/hooks/useCoupons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, total, companyId, companyName, companyPhone, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();
  const incrementCouponUsage = useIncrementCouponUsage();

  // Ref to prevent double submission - using both ref and state for iOS compatibility
  const isSubmittingRef = useRef(false);
  const lastSubmitTimeRef = useRef(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    notes: "",
  });
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [cashChangeFor, setCashChangeFor] = useState("");

  // Fetch user profile to pre-fill phone
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            phone: data.phone || prev.phone,
          }));
        }
      }
    };
    fetchUserProfile();
  }, [user?.id]);

  const finalTotal = appliedCoupon ? Math.max(0, total - appliedCoupon.discount) : total;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateWhatsAppMessage = useCallback(() => {
    let message = `🍔 *Novo Pedido - ${companyName}*\n\n`;
    message += `👤 *Cliente:* ${formData.name}\n`;
    message += `📱 *Telefone:* ${formData.phone}\n\n`;

    if (orderType === "delivery") {
      message += `📍 *Endereço:*\n`;
      message += `${formData.street}, ${formData.number}\n`;
      message += `${formData.neighborhood} - ${formData.city}\n`;
      if (formData.complement) message += `Complemento: ${formData.complement}\n`;
    } else {
      message += `🏪 *Retirada no local*\n`;
    }

    message += `\n💳 *Pagamento:* ${paymentMethod === "cash" ? "Dinheiro" : "Cartão"}`;
    if (paymentMethod === "cash" && cashChangeFor.trim()) {
      message += ` (troco para R$ ${Number(cashChangeFor).toFixed(2).replace(".", ",")})`;
    }

    message += `\n\n📦 *Itens do Pedido:*\n`;
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}\n`;
      if (item.observation) message += `  _(${item.observation})_\n`;
    });

    message += `\n💰 *Subtotal: R$ ${total.toFixed(2).replace(".", ",")}*`;

    if (appliedCoupon) {
      message += `\n🎟️ *Cupom: ${appliedCoupon.code}* (-R$ ${appliedCoupon.discount.toFixed(2).replace(".", ",")})`;
    }

    message += `\n💰 *Total: R$ ${finalTotal.toFixed(2).replace(".", ",")}*`;

    if (formData.notes) {
      message += `\n\n📝 *Observações:* ${formData.notes}`;
    }

    return encodeURIComponent(message);
  }, [companyName, formData, orderType, paymentMethod, cashChangeFor, items, total, appliedCoupon, finalTotal]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !companyId) return;

    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        companyId,
        orderTotal: total,
        userId: user?.id,
      });

      setAppliedCoupon({
        id: result.coupon.id,
        code: result.coupon.code,
        discount: result.discount,
      });

      toast({
        title: "Cupom aplicado!",
        description: `Desconto de R$ ${result.discount.toFixed(2).replace(".", ",")}`,
      });
    } catch (error: any) {
      toast({
        title: "Cupom inválido",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Multiple guards against double submission (especially for iOS)
    const now = Date.now();
    if (isSubmittingRef.current || isLoading || isSubmitted) {
      console.log("Prevented duplicate submit - flags");
      return;
    }
    
    // Debounce: prevent submits within 2 seconds of each other
    if (now - lastSubmitTimeRef.current < 2000) {
      console.log("Prevented duplicate submit - debounce");
      return;
    }
    
    // Set all guards immediately
    isSubmittingRef.current = true;
    lastSubmitTimeRef.current = now;
    setIsSubmitted(true);
    setIsLoading(true);

    try {
      const paymentLine =
        paymentMethod === "cash"
          ? `Pagamento: Dinheiro${cashChangeFor.trim() ? ` | Troco para: R$ ${Number(cashChangeFor).toFixed(2).replace(".", ",")}` : ""}`
          : "Pagamento: Cartão";

      const notesWithPayment = formData.notes
        ? `${paymentLine} | ${formData.notes}`
        : paymentLine;

      await createOrder.mutateAsync({
        order: {
          company_id: companyId!,
          user_id: user?.id,
          customer_name: formData.name,
          customer_phone: formData.phone,
          order_type: orderType,
          address_street: orderType === "delivery" ? formData.street : null,
          address_number: orderType === "delivery" ? formData.number : null,
          address_neighborhood: orderType === "delivery" ? formData.neighborhood : null,
          address_complement: orderType === "delivery" ? formData.complement : null,
          address_city: orderType === "delivery" ? formData.city : null,
          notes: notesWithPayment,
          subtotal: total,
          delivery_fee: 0,
          discount_amount: appliedCoupon ? appliedCoupon.discount : null,
          coupon_id: appliedCoupon ? appliedCoupon.id : null,
          total: finalTotal,
          status: "pending",
        },
        items: items.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          observation: item.observation,
          order_id: "",
        })),
      });

      if (appliedCoupon) {
        await incrementCouponUsage.mutateAsync(appliedCoupon.id);
      }

      if (companyPhone) {
        const phone = companyPhone.replace(/\D/g, "");
        const message = generateWhatsAppMessage();
        window.open(`https://wa.me/55${phone}?text=${message}`, "_blank");
      }

      toast({
        title: "Pedido realizado!",
        description: "Você será redirecionado para o WhatsApp.",
      });

      clearCart();
      navigate("/home");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar pedido";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      // Reset the guards on error so user can try again
      isSubmittingRef.current = false;
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading, isSubmitted, paymentMethod, cashChangeFor, formData, 
    companyId, user?.id, orderType, total, appliedCoupon, finalTotal, 
    items, companyPhone, createOrder, incrementCouponUsage, clearCart, 
    navigate, toast, generateWhatsAppMessage
  ]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Require login to place order
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <LogIn className="w-16 h-16 text-muted-foreground" />
        <h2 className="font-display text-xl font-bold text-foreground">Faça login para continuar</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Para fazer seu pedido, você precisa estar logado. Assim conseguimos salvar seu histórico de pedidos.
        </p>
        <Link to="/auth" state={{ from: "/checkout" }}>
          <Button variant="hero" size="lg">
            <LogIn className="w-5 h-5 mr-2" />
            Entrar ou Cadastrar
          </Button>
        </Link>
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Voltar ao restaurante
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground" />
        <h2 className="font-display text-xl font-bold text-foreground">Carrinho vazio</h2>
        <p className="text-muted-foreground text-center">Adicione itens ao carrinho para continuar</p>
        <Link to="/home">
          <Button variant="hero">Ver restaurantes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold">Finalizar Pedido</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Order Summary */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <h2 className="font-semibold text-foreground mb-4">Resumo do Pedido</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                <span className="text-foreground font-medium">
                  R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 mt-1">
                  <span>Cupom ({appliedCoupon.code})</span>
                  <span>-R$ {appliedCoupon.discount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span className="text-primary">R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Ticket className="w-4 h-4" /> Cupom de Desconto
          </h2>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-500/10 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="font-mono font-bold text-green-600">{appliedCoupon.code}</span>
              </div>
              <button onClick={handleRemoveCoupon} className="p-1 hover:bg-green-500/20 rounded">
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Digite o cupom"
                className="font-mono"
              />
              <Button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode.trim()}>
                {isValidatingCoupon ? "..." : "Aplicar"}
              </Button>
            </div>
          )}
        </div>

        {/* Order Type */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <h2 className="font-semibold text-foreground mb-4">Tipo de Pedido</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                orderType === "delivery" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Delivery
            </button>
            <button
              type="button"
              onClick={() => setOrderType("pickup")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                orderType === "pickup" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Retirada
            </button>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <h2 className="font-semibold text-foreground mb-4">Forma de Pagamento</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === "cash" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Dinheiro
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Cartão
            </button>
          </div>

          {paymentMethod === "cash" && (
            <div className="mt-4">
              <Label htmlFor="cashChangeFor">Troco para (opcional)</Label>
              <Input
                id="cashChangeFor"
                inputMode="decimal"
                value={cashChangeFor}
                onChange={(e) => setCashChangeFor(e.target.value)}
                placeholder="Ex: 50,00"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Se você preencher, o restaurante já prepara o troco.
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <h2 className="font-semibold text-foreground mb-4">Seus Dados</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Seu nome" className="pl-10" required />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(11) 99999-9999" className="pl-10" required />
                </div>
              </div>
            </div>
          </div>

          {orderType === "delivery" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card rounded-xl p-4 shadow-card">
              <h2 className="font-semibold text-foreground mb-4"><MapPin className="w-4 h-4 inline mr-2" />Endereço de Entrega</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input id="street" name="street" value={formData.street} onChange={handleChange} placeholder="Nome da rua" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" name="number" value={formData.number} onChange={handleChange} placeholder="123" className="mt-1" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Seu bairro" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Sua cidade" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento (opcional)</Label>
                  <Input id="complement" name="complement" value={formData.complement} onChange={handleChange} placeholder="Apto, bloco, referência..." className="mt-1" />
                </div>
              </div>
            </motion.div>
          )}

          <div className="bg-card rounded-xl p-4 shadow-card">
            <h2 className="font-semibold text-foreground mb-4">Observações</h2>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Alguma observação para o restaurante?" className="w-full p-3 rounded-lg border border-border bg-background text-foreground resize-none" rows={3} />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar pedido via WhatsApp
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
