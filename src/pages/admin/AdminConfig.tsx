import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2, Shield, RefreshCw } from "lucide-react";

const AdminConfig = () => {
  const { toast } = useToast();
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const handleCreateAdmin = async () => {
    setCreatingAdmin(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-admin");
      
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: data.message,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar admin",
        variant: "destructive",
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <AdminLayout 
      title="Configurações" 
      subtitle="Configurações do sistema"
    >
      <div className="grid gap-6">
        {/* Admin Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configuração de Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Crie ou recrie o usuário administrador padrão do sistema.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Credenciais padrão:</p>
              <p className="text-sm text-muted-foreground">Email: bigfood@bigfood.com</p>
              <p className="text-sm text-muted-foreground">Senha: BigFood</p>
            </div>
            <Button onClick={handleCreateAdmin} disabled={creatingAdmin}>
              {creatingAdmin ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Criar/Atualizar Admin
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminConfig;
