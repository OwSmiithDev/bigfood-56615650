import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Eye,
  Calendar,
  Phone,
  Mail,
  Trash2,
  Ban,
  Clock,
  Edit
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  useAdminCompanies, 
  useUpdateSubscription, 
  useToggleCompanyOpen, 
  useDeleteCompany,
  useAdminPlans 
} from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type StatusFilter = "all" | "pending" | "active" | "paused" | "expired" | "canceled";

const AdminCompanies = () => {
  const { toast } = useToast();
  const { data: companies, isLoading } = useAdminCompanies();
  const { data: plans } = useAdminPlans();
  const updateSubscription = useUpdateSubscription();
  const toggleCompanyOpen = useToggleCompanyOpen();
  const deleteCompany = useDeleteCompany();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCompany, setSelectedCompany] = useState<typeof companies extends (infer T)[] ? T : never | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"approve" | "pause" | "details" | "edit" | "expire" | "cancel">("details");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<NonNullable<typeof companies>[0] | null>(null);

  // Form states
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = 
      company.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = company.subscriptions?.[0]?.status;
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const handleAction = (company: NonNullable<typeof companies>[0], action: typeof dialogAction) => {
    setSelectedCompany(company);
    setDialogAction(action);
    setNotes(company.subscriptions?.[0]?.notes || "");
    setSelectedPlan(company.subscriptions?.[0]?.plan_id || "free");
    setExpiresAt(company.subscriptions?.[0]?.expires_at?.split("T")[0] || "");
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedCompany?.subscriptions?.[0]) return;

    try {
      await updateSubscription.mutateAsync({
        subscriptionId: selectedCompany.subscriptions[0].id,
        status: "active",
        planId: selectedPlan,
        expiresAt: expiresAt || null,
        notes,
      });

      toast({
        title: "Empresa aprovada!",
        description: `${selectedCompany.display_name} foi aprovada com sucesso.`,
      });

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao aprovar",
        description: "Ocorreu um erro ao aprovar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handlePause = async () => {
    if (!selectedCompany?.subscriptions?.[0]) return;

    try {
      await updateSubscription.mutateAsync({
        subscriptionId: selectedCompany.subscriptions[0].id,
        status: "paused",
        notes,
      });

      toast({
        title: "Empresa pausada",
        description: `${selectedCompany.display_name} foi pausada.`,
      });

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao pausar",
        description: "Ocorreu um erro ao pausar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleExpire = async () => {
    if (!selectedCompany?.subscriptions?.[0]) return;

    try {
      await updateSubscription.mutateAsync({
        subscriptionId: selectedCompany.subscriptions[0].id,
        status: "expired",
        notes,
      });

      toast({
        title: "Assinatura expirada",
        description: `A assinatura de ${selectedCompany.display_name} foi marcada como expirada.`,
      });

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao expirar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!selectedCompany?.subscriptions?.[0]) return;

    try {
      await updateSubscription.mutateAsync({
        subscriptionId: selectedCompany.subscriptions[0].id,
        status: "canceled",
        notes,
      });

      toast({
        title: "Assinatura cancelada",
        description: `A assinatura de ${selectedCompany.display_name} foi cancelada.`,
      });

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cancelar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedCompany?.subscriptions?.[0]) return;

    try {
      await updateSubscription.mutateAsync({
        subscriptionId: selectedCompany.subscriptions[0].id,
        planId: selectedPlan,
        expiresAt: expiresAt || null,
        notes,
      });

      toast({
        title: "Plano atualizado",
        description: `O plano de ${selectedCompany.display_name} foi atualizado.`,
      });

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o plano.",
        variant: "destructive",
      });
    }
  };

  const handleReactivate = async (company: NonNullable<typeof companies>[0]) => {
    if (!company.subscriptions?.[0]) return;

    try {
      await updateSubscription.mutateAsync({
        subscriptionId: company.subscriptions[0].id,
        status: "active",
      });

      toast({
        title: "Empresa reativada!",
        description: `${company.display_name} foi reativada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao reativar",
        description: "Ocorreu um erro ao reativar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleToggleOpen = async (company: NonNullable<typeof companies>[0]) => {
    try {
      await toggleCompanyOpen.mutateAsync({
        companyId: company.id,
        isOpen: !company.is_open,
      });

      toast({
        title: company.is_open ? "Restaurante fechado" : "Restaurante aberto",
        description: `${company.display_name} está agora ${company.is_open ? "fechado" : "aberto"}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    try {
      await deleteCompany.mutateAsync(companyToDelete.id);
      toast({
        title: "Empresa excluída",
        description: `${companyToDelete.display_name} foi excluída permanentemente.`,
      });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Ocorreu um erro ao excluir a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = (company: NonNullable<typeof companies>[0]) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-600",
    pending: "bg-yellow-500/10 text-yellow-600",
    paused: "bg-red-500/10 text-red-600",
    expired: "bg-gray-500/10 text-gray-600",
    canceled: "bg-gray-500/10 text-gray-600",
  };

  const statusLabels: Record<string, string> = {
    active: "Ativo",
    pending: "Pendente",
    paused: "Pausado",
    expired: "Expirado",
    canceled: "Cancelado",
  };

  return (
    <AdminLayout 
      title="Empresas" 
      subtitle="Gerencie todas as empresas cadastradas"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-2.5 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Total</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold">{companies?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Ativos</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                {companies?.filter(c => c.subscriptions?.[0]?.status === "active").length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-500/10 shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Pendentes</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                {companies?.filter(c => c.subscriptions?.[0]?.status === "pending").length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 shrink-0">
              <PauseCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Pausados</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                {companies?.filter(c => c.subscriptions?.[0]?.status === "paused").length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-2.5 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gray-500/10 shrink-0">
              <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">Cancelados</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                {companies?.filter(c => 
                  c.subscriptions?.[0]?.status === "canceled" || 
                  c.subscriptions?.[0]?.status === "expired"
                ).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-40 lg:w-48 text-sm">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 shrink-0" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="paused">Pausados</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="canceled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company, index) => {
            const subscription = company.subscriptions?.[0];
            const status = subscription?.status || "pending";

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-4 lg:p-6 gap-3 sm:gap-4">
                      {/* Company Info */}
                      <div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt="" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
                          ) : (
                            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{company.display_name}</h3>
                            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${statusColors[status]}`}>
                              {statusLabels[status]}
                            </span>
                            {company.is_open && (
                              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 shrink-0">
                                Aberto
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {company.category} • {subscription?.plans?.name || "Sem plano"}
                            {subscription?.expires_at && (
                              <span className="text-yellow-600">
                                {" "}• Exp: {format(new Date(subscription.expires_at), "dd/MM/yy", { locale: ptBR })}
                              </span>
                            )}
                          </p>
                          <div className="hidden sm:flex items-center gap-3 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                            {company.phone && (
                              <span className="flex items-center gap-1 truncate">
                                <Phone className="w-3 h-3 shrink-0" /> <span className="truncate">{company.phone}</span>
                              </span>
                            )}
                            {company.email && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{company.email}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(company, "approve")}
                            className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Aprovar</span>
                          </Button>
                        )}
                        
                        {(status === "paused" || status === "expired" || status === "canceled") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReactivate(company)}
                            className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                          >
                            <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Reativar</span>
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction(company, "details")}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(company, "edit")}>
                              <Edit className="w-4 h-4 mr-2" />
                              Alterar plano
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleOpen(company)}>
                              {company.is_open ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Fechar restaurante
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Abrir restaurante
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {status === "active" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleAction(company, "pause")}
                                  className="text-yellow-600"
                                >
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Pausar assinatura
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleAction(company, "expire")}
                                  className="text-orange-600"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Marcar como expirado
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleAction(company, "cancel")}
                                  className="text-red-600"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Cancelar assinatura
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleConfirmDelete(company)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir empresa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" && "Aprovar Empresa"}
              {dialogAction === "pause" && "Pausar Assinatura"}
              {dialogAction === "details" && "Detalhes da Empresa"}
              {dialogAction === "edit" && "Alterar Plano"}
              {dialogAction === "expire" && "Expirar Assinatura"}
              {dialogAction === "cancel" && "Cancelar Assinatura"}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany?.display_name}
            </DialogDescription>
          </DialogHeader>

          {dialogAction === "details" && selectedCompany && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Razão Social</Label>
                  <p className="font-medium">{selectedCompany.business_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CNPJ</Label>
                  <p className="font-medium">{selectedCompany.cnpj || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{selectedCompany.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedCompany.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Categoria</Label>
                  <p className="font-medium">{selectedCompany.category || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Taxa de Entrega</Label>
                  <p className="font-medium">R$ {Number(selectedCompany.delivery_fee || 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plano Atual</Label>
                  <p className="font-medium">{selectedCompany.subscriptions?.[0]?.plans?.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className={`font-medium ${statusColors[selectedCompany.subscriptions?.[0]?.status || "pending"]}`}>
                    {statusLabels[selectedCompany.subscriptions?.[0]?.status || "pending"]}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Endereço</Label>
                <p className="font-medium">
                  {[
                    selectedCompany.street,
                    selectedCompany.number,
                    selectedCompany.neighborhood,
                    selectedCompany.city,
                    selectedCompany.state,
                  ].filter(Boolean).join(", ") || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cadastrado em</Label>
                  <p className="font-medium">
                    {format(new Date(selectedCompany.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                {selectedCompany.subscriptions?.[0]?.expires_at && (
                  <div>
                    <Label className="text-muted-foreground">Expira em</Label>
                    <p className="font-medium">
                      {format(new Date(selectedCompany.subscriptions[0].expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
              {selectedCompany.subscriptions?.[0]?.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedCompany.subscriptions[0].notes}</p>
                </div>
              )}
            </div>
          )}

          {(dialogAction === "approve" || dialogAction === "edit") && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan">Plano</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - R$ {Number(plan.price).toFixed(2)}
                        {plan.max_products && ` (até ${plan.max_products} produtos)`}
                      </SelectItem>
                    )) || (
                      <>
                        <SelectItem value="free">Grátis - R$ 0,00 (5 produtos)</SelectItem>
                        <SelectItem value="basic">Básico - R$ 49,90 (50 produtos)</SelectItem>
                        <SelectItem value="premium">Premium - R$ 99,90 (ilimitado)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expires">Data de Expiração (opcional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="expires"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas sobre a aprovação..."
                />
              </div>
            </div>
          )}

          {dialogAction === "pause" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Ao pausar a assinatura, a empresa não poderá mais receber pedidos ou acessar o painel.
              </p>
              <div>
                <Label htmlFor="pauseNotes">Motivo da pausa</Label>
                <Textarea
                  id="pauseNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Pagamento em atraso..."
                />
              </div>
            </div>
          )}

          {dialogAction === "expire" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Marcar a assinatura como expirada irá bloquear o acesso da empresa até que seja renovada.
              </p>
              <div>
                <Label htmlFor="expireNotes">Motivo da expiração</Label>
                <Textarea
                  id="expireNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Período de teste encerrado..."
                />
              </div>
            </div>
          )}

          {dialogAction === "cancel" && (
            <div className="space-y-4">
              <p className="text-destructive">
                Cancelar a assinatura irá encerrar permanentemente o acesso da empresa. 
                Essa ação pode ser revertida reativando a assinatura.
              </p>
              <div>
                <Label htmlFor="cancelNotes">Motivo do cancelamento</Label>
                <Textarea
                  id="cancelNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Solicitação do cliente..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {dialogAction === "details" ? "Fechar" : "Cancelar"}
            </Button>
            {dialogAction === "approve" && (
              <Button onClick={handleApprove} disabled={updateSubscription.isPending}>
                {updateSubscription.isPending ? "Aprovando..." : "Aprovar Empresa"}
              </Button>
            )}
            {dialogAction === "edit" && (
              <Button onClick={handleUpdatePlan} disabled={updateSubscription.isPending}>
                {updateSubscription.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            )}
            {dialogAction === "pause" && (
              <Button 
                variant="destructive" 
                onClick={handlePause}
                disabled={updateSubscription.isPending}
              >
                {updateSubscription.isPending ? "Pausando..." : "Pausar Assinatura"}
              </Button>
            )}
            {dialogAction === "expire" && (
              <Button 
                variant="destructive" 
                onClick={handleExpire}
                disabled={updateSubscription.isPending}
              >
                {updateSubscription.isPending ? "Processando..." : "Expirar Assinatura"}
              </Button>
            )}
            {dialogAction === "cancel" && (
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={updateSubscription.isPending}
              >
                {updateSubscription.isPending ? "Cancelando..." : "Cancelar Assinatura"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{companyToDelete?.display_name}"? 
              Esta ação não pode ser desfeita e irá remover todos os produtos, pedidos e dados da empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCompanies;