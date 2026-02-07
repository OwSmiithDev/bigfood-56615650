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
    if (!receiptRef.current) return;

    const receiptHTML = receiptRef.current.innerHTML;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Comanda</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              width: 80mm;
              padding: 4mm;
            }
            .text-center { text-align: center; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 12px; }
            .text-\\[10px\\] { font-size: 10px; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: 'Courier New', Courier, monospace; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .pl-3 { padding-left: 12px; }
            .italic { font-style: italic; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .leading-relaxed { line-height: 1.625; }
            .p-4 { padding: 16px; }
            @media print {
              body { width: 80mm; padding: 0; margin: 0; }
              @page { size: 80mm auto; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Pré-visualização da Comanda
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="border border-border rounded-lg overflow-hidden">
          <OrderReceipt order={order} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
