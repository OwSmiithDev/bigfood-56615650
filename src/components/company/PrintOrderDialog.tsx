import { useRef } from "react";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OrderReceipt from "./OrderReceipt";

interface PrintOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

const PrintOrderDialog = ({ open, onOpenChange, order }: PrintOrderDialogProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto print-dialog">
        <DialogHeader className="print-hide">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Pré-visualização da Comanda
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="border border-border rounded-lg overflow-hidden">
          <OrderReceipt order={order} />
        </div>

        <DialogFooter className="print-hide gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrderDialog;
