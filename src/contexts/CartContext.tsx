import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  companyId: string | null;
  companyName: string | null;
  companyPhone: string | null;
  addItem: (item: Omit<CartItem, "id">, companyId: string, companyName: string, companyPhone: string | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyPhone, setCompanyPhone] = useState<string | null>(null);

  const addItem = (item: Omit<CartItem, "id">, newCompanyId: string, newCompanyName: string, phone: string | null) => {
    if (companyId && companyId !== newCompanyId) {
      setItems([]);
    }
    
    setCompanyId(newCompanyId);
    setCompanyName(newCompanyName);
    setCompanyPhone(phone);

    setItems((prev) => {
      const existingItem = prev.find((i) => i.productId === item.productId);
      if (existingItem) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: crypto.randomUUID() }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.id !== id);
      if (newItems.length === 0) {
        setCompanyId(null);
        setCompanyName(null);
        setCompanyPhone(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCompanyId(null);
    setCompanyName(null);
    setCompanyPhone(null);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        companyId,
        companyName,
        companyPhone,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
