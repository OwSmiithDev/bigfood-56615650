interface OrderItem {
  id: string;
  quantity: number;
  product_name: string;
  price: number;
  observation?: string | null;
}

interface OrderReceiptProps {
  order: {
    id: string;
    created_at: string;
    customer_name: string | null;
    customer_phone: string | null;
    order_type: string;
    order_items?: OrderItem[];
    subtotal: number;
    delivery_fee: number;
    discount_amount: number | null;
    total: number;
    address_street: string | null;
    address_number: string | null;
    address_neighborhood: string | null;
    address_city: string | null;
    address_complement: string | null;
    notes: string | null;
  };
}

const separator = "================================";

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;

const OrderReceipt = ({ order }: OrderReceiptProps) => {
  const orderNumber = order.id.substring(0, 8).toUpperCase();
  const date = new Date(order.created_at).toLocaleString("pt-BR");
  const orderTypeLabel = order.order_type === "delivery" ? "Entrega" : "Retirada";

  return (
    <div
      id="print-receipt"
      className="font-mono text-xs leading-relaxed p-4 font-bold"
      style={{ width: "80mm", maxWidth: "100%", margin: "0 auto", color: "#000", background: "#fff" }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <p className="text-sm font-bold">- BIGFOOD -</p>
      </div>
      <p>{separator}</p>

      {/* Order info */}
      <p>Pedido: #{orderNumber}</p>
      <p>Data: {date}</p>
      <p>Cliente: {order.customer_name || "Não informado"}</p>
      {order.customer_phone && <p>Tel: {order.customer_phone}</p>}
      <p>Tipo: {orderTypeLabel}</p>
      <p>{separator}</p>

      {/* Items */}
      <p className="font-bold">ITENS:</p>
      {order.order_items?.map((item) => (
        <div key={item.id} className="mb-1">
          <div className="flex justify-between">
            <span>{item.quantity}x {item.product_name}</span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
          {item.observation && (
            <p className="pl-3 text-[10px] italic">Obs: {item.observation}</p>
          )}
        </div>
      ))}
      <p>{separator}</p>

      {/* Totals */}
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>{formatCurrency(order.subtotal)}</span>
      </div>
      {order.delivery_fee > 0 && (
        <div className="flex justify-between">
          <span>Taxa entrega:</span>
          <span>{formatCurrency(order.delivery_fee)}</span>
        </div>
      )}
      {order.discount_amount && order.discount_amount > 0 && (
        <div className="flex justify-between">
          <span>Desconto:</span>
          <span>-{formatCurrency(order.discount_amount)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-sm mt-1">
        <span>TOTAL:</span>
        <span>{formatCurrency(order.total)}</span>
      </div>
      <p>{separator}</p>

      {/* Address */}
      {order.order_type === "delivery" && order.address_street && (
        <>
          <p className="font-bold">ENDEREÇO:</p>
          <p>
            {order.address_street}, {order.address_number}
            {order.address_complement ? ` - ${order.address_complement}` : ""}
          </p>
          <p>
            {order.address_neighborhood}
            {order.address_city ? ` - ${order.address_city}` : ""}
          </p>
          <p>{separator}</p>
        </>
      )}

      {/* Notes */}
      {order.notes && (
        <>
          <p className="font-bold">OBS / PAGAMENTO:</p>
          <p>{order.notes}</p>
          <p>{separator}</p>
        </>
      )}

      <p className="text-center mt-2 text-[10px]">Obrigado pela preferência!</p>
    </div>
  );
};

export default OrderReceipt;
