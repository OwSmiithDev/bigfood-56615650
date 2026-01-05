import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAllCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/hooks/useCoupons";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminCoupons = () => {
  const { toast } = useToast();
  const { data: coupons, isLoading } = useAllCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_value: "",
    max_uses: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  const filteredCoupons =
    coupons?.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const openModal = (coupon?: any) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_order_value: coupon.min_order_value?.toString() || "",
        max_uses: coupon.max_uses?.toString() || "",
        valid_from: coupon.valid_from
          ? coupon.valid_from.split("T")[0]
          : "",
        valid_until: coupon.valid_until
          ? coupon.valid_until.split("T")[0]
          : "",
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      setForm({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_value: "",
        max_uses: "",
        valid_from: "",
        valid_until: "",
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discount_value) {
      toast({
        title: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        code: form.code,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_value: form.min_order_value
          ? parseFloat(form.min_order_value)
          : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        is_active: form.is_active,
        company_id: null, // Global coupon (admin)
      };

      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, ...data });
        toast({ title: "Cupom atualizado!" });
      } else {
        await createCoupon.mutateAsync(data);
        toast({ title: "Cupom criado!" });
      }
      setShowModal(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cupom?")) return;
    try {
      await deleteCoupon.mutateAsync(id);
      toast({ title: "Cupom excluído!" });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (coupon: any) => {
    try {
      await updateCoupon.mutateAsync({
        id: coupon.id,
        is_active: !coupon.is_active,
      });
      toast({
        title: coupon.is_active ? "Cupom desativado" : "Cupom ativado",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Cupons" subtitle="Gerencie cupons de desconto globais">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cupom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cupom
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{coupons?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-xl font-bold">
                {coupons?.filter((c) => c.is_active).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Percent className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usos Totais</p>
              <p className="text-xl font-bold">
                {coupons?.reduce((acc, c) => acc + c.used_count, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))
        ) : filteredCoupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cupom encontrado</p>
              <Button onClick={() => openModal()} className="mt-4">
                Criar primeiro cupom
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredCoupons.map((coupon, index) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                          coupon.is_active
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        {coupon.discount_type === "percentage" ? (
                          <Percent
                            className={`w-6 h-6 ${
                              coupon.is_active
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        ) : (
                          <DollarSign
                            className={`w-6 h-6 ${
                              coupon.is_active
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg font-mono">
                            {coupon.code}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              coupon.is_active
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {coupon.is_active ? "Ativo" : "Inativo"}
                          </span>
                          {coupon.company_id && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                              Empresa
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {coupon.description ||
                            (coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}% de desconto`
                              : `R$ ${coupon.discount_value.toFixed(2)} de desconto`)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          <span>
                            Usos: {coupon.used_count}
                            {coupon.max_uses ? `/${coupon.max_uses}` : ""}
                          </span>
                          {coupon.min_order_value && (
                            <span>
                              Mín: R${" "}
                              {coupon.min_order_value
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                          )}
                          {coupon.valid_until && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Até{" "}
                              {format(
                                new Date(coupon.valid_until),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => toggleActive(coupon)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(coupon)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">
                  {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Código *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="DESCONTO10"
                    className="mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="10% de desconto em todos os pedidos"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Tipo de Desconto</Label>
                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, discount_type: "percentage" }))
                      }
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        form.discount_type === "percentage"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      Porcentagem
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, discount_type: "fixed" }))
                      }
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        form.discount_type === "fixed"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      Valor Fixo
                    </button>
                  </div>
                </div>

                <div>
                  <Label>
                    {form.discount_type === "percentage"
                      ? "Desconto (%)"
                      : "Desconto (R$)"}{" "}
                    *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discount_value: e.target.value }))
                    }
                    placeholder={
                      form.discount_type === "percentage" ? "10" : "5.00"
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Pedido Mínimo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.min_order_value}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        min_order_value: e.target.value,
                      }))
                    }
                    placeholder="30.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Máximo de Usos</Label>
                  <Input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, max_uses: e.target.value }))
                    }
                    placeholder="100 (deixe em branco para ilimitado)"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Válido a partir de</Label>
                    <Input
                      type="date"
                      value={form.valid_from}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, valid_from: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Válido até</Label>
                    <Input
                      type="date"
                      value={form.valid_until}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, valid_until: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Cupom Ativo</Label>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, is_active: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSave}>
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminCoupons;
