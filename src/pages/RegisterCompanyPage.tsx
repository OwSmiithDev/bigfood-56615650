import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Store, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/hooks/use-toast";
import { RESTAURANT_CATEGORIES } from "@/constants/categories";
const RegisterCompanyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createCompany } = useCompany();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    display_name: "",
    category: "",
    phone: "",
    email: "",
    description: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      navigate("/auth?tab=register&type=company");
      return;
    }

    setIsLoading(true);

    try {
      await createCompany.mutateAsync({
        business_name: formData.business_name,
        display_name: formData.display_name,
        category: formData.category || null,
        phone: formData.phone || null,
        email: formData.email || null,
        description: formData.description || null,
        street: formData.street || null,
        number: formData.number || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
      });

      toast({
        title: "Empresa cadastrada!",
        description: "Sua empresa foi criada com sucesso.",
      });

      navigate("/empresa");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar empresa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-lg font-bold">Cadastrar Empresa</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Informações básicas
                </h2>
                <p className="text-muted-foreground mt-2">
                  Conte-nos sobre seu estabelecimento
                </p>
              </div>

              <div>
                <Label>Razão Social</Label>
                <Input
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Nome oficial da empresa"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>Nome de exibição</Label>
                <Input
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="Como os clientes verão"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 rounded-lg border border-border bg-background"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {RESTAURANT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Descrição</Label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Fale um pouco sobre seu estabelecimento..."
                  className="w-full mt-1 p-3 rounded-lg border border-border bg-background resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="button"
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Contato
                </h2>
                <p className="text-muted-foreground mt-2">
                  Como seus clientes podem te encontrar
                </p>
              </div>

              <div>
                <Label>WhatsApp</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>E-mail</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@suaempresa.com"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(3)}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Endereço
                </h2>
                <p className="text-muted-foreground mt-2">
                  Onde seu estabelecimento está localizado
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>Rua</Label>
                  <Input
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Bairro</Label>
                <Input
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cidade</Label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="SP"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>CEP</Label>
                <Input
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterCompanyPage;
