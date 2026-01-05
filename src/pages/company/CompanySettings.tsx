import { useState, useEffect } from "react";
import {
  Menu,
  Store,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/hooks/use-toast";
import { CompanySidebar } from "@/components/company/CompanySidebar";
import { ImageUpload } from "@/components/ImageUpload";
import { OpeningHoursEditor, OpeningHours, defaultOpeningHours } from "@/components/company/OpeningHoursEditor";
import { useRealtimeCompany } from "@/hooks/useRealtimeUpdates";

const CompanySettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { company, updateCompany, isLoading } = useCompany();

  // Enable realtime updates
  useRealtimeCompany(company?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(defaultOpeningHours);
  const [autoManageHours, setAutoManageHours] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    description: "",
    phone: "",
    category: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    delivery_fee: "",
    estimated_delivery_time: "",
    min_order_value: "",
    is_open: false,
    delivery_enabled: true,
    pickup_enabled: true,
    logo_url: "",
    banner_url: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        display_name: company.display_name || "",
        description: company.description || "",
        phone: company.phone || "",
        category: company.category || "",
        street: company.street || "",
        number: company.number || "",
        neighborhood: company.neighborhood || "",
        city: company.city || "",
        state: company.state || "",
        zip_code: company.zip_code || "",
        delivery_fee: company.delivery_fee?.toString() || "",
        estimated_delivery_time: company.estimated_delivery_time || "",
        min_order_value: company.min_order_value?.toString() || "",
        is_open: company.is_open || false,
        delivery_enabled: company.delivery_enabled ?? true,
        pickup_enabled: company.pickup_enabled ?? true,
        logo_url: company.logo_url || "",
        banner_url: company.banner_url || "",
      });

      // Load opening hours from company
      const savedHours = company.opening_hours as unknown as OpeningHours | null;
      if (savedHours && typeof savedHours === 'object' && 'monday' in savedHours) {
        setOpeningHours(savedHours);
        setAutoManageHours(true);
      }
    }
  }, [company]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!company) return;

    try {
      await updateCompany.mutateAsync({
        id: company.id,
        display_name: formData.display_name,
        description: formData.description || null,
        phone: formData.phone || null,
        category: formData.category || null,
        street: formData.street || null,
        number: formData.number || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        delivery_fee: formData.delivery_fee ? parseFloat(formData.delivery_fee) : 0,
        estimated_delivery_time: formData.estimated_delivery_time || null,
        min_order_value: formData.min_order_value
          ? parseFloat(formData.min_order_value)
          : 0,
        is_open: formData.is_open,
        delivery_enabled: formData.delivery_enabled,
        pickup_enabled: formData.pickup_enabled,
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
        opening_hours: autoManageHours ? JSON.parse(JSON.stringify(openingHours)) : {},
      });
      toast({ title: "Configurações salvas!" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    }
  };

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
                Configurações
              </h1>
            </div>
            <Button variant="hero" size="sm" onClick={handleSave} disabled={isLoading}>
              Salvar
            </Button>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* Status */}
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground text-sm sm:text-base">Status da Loja</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {autoManageHours 
                      ? "Gerenciado automaticamente pelos horários de funcionamento" 
                      : "Controle manual se sua loja está aberta para pedidos"}
                  </p>
                </div>
                <Switch
                  checked={formData.is_open}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, is_open: checked }))
                  }
                  disabled={autoManageHours}
                />
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card">
              <h2 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Horários de Funcionamento
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">Gerenciar automaticamente</p>
                    <p className="text-xs text-muted-foreground">
                      A loja abrirá e fechará automaticamente nos horários definidos
                    </p>
                  </div>
                  <Switch
                    checked={autoManageHours}
                    onCheckedChange={setAutoManageHours}
                  />
                </div>
                {autoManageHours && (
                  <OpeningHoursEditor
                    value={openingHours}
                    onChange={setOpeningHours}
                  />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card">
              <h2 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                Informações do Estabelecimento
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm">Nome do estabelecimento</Label>
                  <Input
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Descrição</Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 rounded-lg border border-border bg-background text-sm"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Categoria</Label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full mt-1 p-3 rounded-lg border border-border bg-background text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="Pizzaria">Pizzaria</option>
                      <option value="Hamburgueria">Hamburgueria</option>
                      <option value="Japonês">Japonês</option>
                      <option value="Saudável">Saudável</option>
                      <option value="Cafeteria">Cafeteria</option>
                      <option value="Doces">Doces</option>
                      <option value="Brasileira">Brasileira</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">WhatsApp</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Logo</Label>
                    <div className="mt-1">
                      <ImageUpload
                        value={formData.logo_url}
                        onChange={(url) => setFormData((p) => ({ ...p, logo_url: url }))}
                        folder="logos"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Banner</Label>
                    <div className="mt-1">
                      <ImageUpload
                        value={formData.banner_url}
                        onChange={(url) => setFormData((p) => ({ ...p, banner_url: url }))}
                        folder="banners"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card">
              <h2 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                Endereço
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  <div className="col-span-3">
                    <Label className="text-xs sm:text-sm">Rua</Label>
                    <Input
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs sm:text-sm">Nº</Label>
                    <Input
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Bairro</Label>
                    <Input
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Cidade</Label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Estado</Label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">CEP</Label>
                    <Input
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card">
              <h2 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Entrega
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Aceitar pedidos para entrega
                    </p>
                  </div>
                  <Switch
                    checked={formData.delivery_enabled}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({ ...p, delivery_enabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">Retirada</p>
                    <p className="text-xs text-muted-foreground">
                      Aceitar pedidos para retirada
                    </p>
                  </div>
                  <Switch
                    checked={formData.pickup_enabled}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({ ...p, pickup_enabled: checked }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Taxa de entrega</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="delivery_fee"
                      value={formData.delivery_fee}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Pedido mínimo</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="min_order_value"
                      value={formData.min_order_value}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Tempo estimado</Label>
                    <Input
                      name="estimated_delivery_time"
                      value={formData.estimated_delivery_time}
                      onChange={handleChange}
                      placeholder="30-45 min"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanySettings;