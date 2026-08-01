"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type CartContextType = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
};

const CartContext = createContext<CartContextType>({
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  cartCount: 0,
  setCartCount: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const count = (data.items ?? []).reduce(
        (s: number, i: { quantity: number }) => s + i.quantity,
        0,
      );
      setCartCount(count);
    }
    init();
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider value={{ isOpen, openCart, closeCart, cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
