import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Shield,
  User,
  Building2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ShieldPlus,
  ShieldMinus,
  Trash2,
  Eye,
  Key,
  Loader2
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type RoleFilter = "all" | "admin" | "user" | "company";

const AdminUsers = () => {
  const { toast } = useToast();
  const { data: users, isLoading } = useAdminUsers();
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedUser, setSelectedUser] = useState<NonNullable<typeof users>[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<NonNullable<typeof users>[0] | null>(null);
  
  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<NonNullable<typeof users>[0] | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const roles = user.user_roles?.map(r => r.role) || [];
    const matchesRole = roleFilter === "all" || roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  }) || [];

  const getRoleIcon = (roles: string[]) => {
    if (roles.includes("admin")) return <Shield className="w-4 h-4 text-purple-500" />;
    if (roles.includes("company")) return <Building2 className="w-4 h-4 text-blue-500" />;
    return <User className="w-4 h-4 text-green-500" />;
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin")) {
      return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">Admin</span>;
    }
    if (roles.includes("company")) {
      return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">Empresa</span>;
    }
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">Usuário</span>;
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await updateUserRole.mutateAsync({
        userId,
        role: "admin",
        action: isAdmin ? "remove" : "add",
      });
      toast({
        title: isAdmin ? "Admin removido" : "Admin adicionado",
        description: isAdmin 
          ? "Permissões de admin removidas com sucesso" 
          : "Permissões de admin adicionadas com sucesso",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleCompany = async (userId: string, isCompany: boolean) => {
    try {
      await updateUserRole.mutateAsync({
        userId,
        role: "company",
        action: isCompany ? "remove" : "add",
      });
      toast({
        title: isCompany ? "Empresa removida" : "Empresa adicionada",
        description: isCompany 
          ? "Permissões de empresa removidas com sucesso" 
          : "Permissões de empresa adicionadas com sucesso",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso",
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (user: NonNullable<typeof users>[0]) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleConfirmDelete = (user: NonNullable<typeof users>[0]) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleOpenPasswordDialog = (user: NonNullable<typeof users>[0]) => {
    setUserToChangePassword(user);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (!userToChangePassword) return;

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { data, error } = await supabase.functions.invoke("update-user-password", {
        body: { userId: userToChangePassword.id, newPassword },
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "A senha do usuário foi alterada com sucesso",
      });

      setPasswordDialogOpen(false);
      setUserToChangePassword(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao alterar senha";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AdminLayout 
      title="Usuários" 
      subtitle="Gerencie todos os usuários cadastrados"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <Shield className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
            <SelectItem value="company">Empresas</SelectItem>
            <SelectItem value="user">Usuários</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{users?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-xl font-bold">
                {users?.filter(u => u.user_roles?.some(r => r.role === "admin")).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Empresas</p>
              <p className="text-xl font-bold">
                {users?.filter(u => u.user_roles?.some(r => r.role === "company")).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <User className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes</p>
              <p className="text-xl font-bold">
                {users?.filter(u => 
                  !u.user_roles?.some(r => r.role === "admin" || r.role === "company")
                ).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user, index) => {
            const roles = user.user_roles?.map(r => r.role) || [];

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            getRoleIcon(roles)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{user.name || "Sem nome"}</h3>
                            {getRoleBadge(roles)}
                            {roles.includes("admin") && roles.includes("company") && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">Empresa</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                            {user.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                              </span>
                            )}
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {user.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 
                              {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(user)}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenPasswordDialog(user)}>
                              <Key className="w-4 h-4 mr-2" />
                              Alterar senha
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleToggleAdmin(user.id, roles.includes("admin"))}
                            >
                              {roles.includes("admin") ? (
                                <>
                                  <ShieldMinus className="w-4 h-4 mr-2" />
                                  Remover Admin
                                </>
                              ) : (
                                <>
                                  <ShieldPlus className="w-4 h-4 mr-2" />
                                  Tornar Admin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleCompany(user.id, roles.includes("company"))}
                            >
                              {roles.includes("company") ? (
                                <>
                                  <Building2 className="w-4 h-4 mr-2" />
                                  Remover Empresa
                                </>
                              ) : (
                                <>
                                  <Building2 className="w-4 h-4 mr-2" />
                                  Tornar Empresa
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleConfirmDelete(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir usuário
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

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas do usuário
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  {selectedUser.avatar_url ? (
                    <img 
                      src={selectedUser.avatar_url} 
                      alt="" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name || "Sem nome"}</h3>
                  <div className="flex gap-2 mt-1">
                    {selectedUser.user_roles?.map(r => (
                      <span 
                        key={r.role}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          r.role === "admin" 
                            ? "bg-purple-500/10 text-purple-600"
                            : r.role === "company"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {r.role === "admin" ? "Admin" : r.role === "company" ? "Empresa" : "Usuário"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{selectedUser.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cadastrado em</Label>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Última atualização</Label>
                  <p className="font-medium">
                    {format(new Date(selectedUser.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">ID do Usuário</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded">{selectedUser.id}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite a nova senha para {userToChangePassword?.name || userToChangePassword?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite novamente"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "{userToDelete?.name || userToDelete?.email}"? 
              Esta ação não pode ser desfeita e irá remover todos os dados do usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
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

export default AdminUsers;
