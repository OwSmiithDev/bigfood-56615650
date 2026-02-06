import { motion } from "framer-motion";
import { Smartphone, Share2, PlusSquare } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/contexts/PWAInstallContext";
import logo from "@/assets/logo-transparent.png";

export default function PWAInstallDialog() {
  const { open, closeDialog, decline, triggerNativeInstall, ios } = usePWAInstall();

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? undefined : closeDialog())}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="p-6"
        >
          <header className="flex items-start gap-4">
            <img
              src={logo}
              alt="Logo do BigFood"
              className="h-12 w-12 rounded-xl bg-muted p-2"
              loading="lazy"
            />
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-foreground">Instalar o BigFood?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Instale para acessar mais rápido e ter uma experiência de app na tela inicial.
              </p>
            </div>
          </header>

          {ios ? (
            <section className="mt-5 rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-muted p-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Como instalar no iPhone/iPad</p>
                  <ol className="mt-1 space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" /> Toque em <span className="font-medium">Compartilhar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <PlusSquare className="h-4 w-4" /> Selecione <span className="font-medium">Adicionar à Tela de Início</span>
                    </li>
                  </ol>
                </div>
              </div>
            </section>
          ) : null}

          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={async () => {
                await triggerNativeInstall();
              }}
              disabled={ios}
            >
              {ios ? "Instale pelo menu do Safari" : "Instalar agora"}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                decline();
              }}
            >
              Agora não
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
