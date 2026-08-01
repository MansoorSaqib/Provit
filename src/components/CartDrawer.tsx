"use client";
import { useEffect, useState } from "react";
import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

type DrawerItem = {
  id: string;
  quantity: number;
  flavor: string;
  product: { name: string; price: string; slug: string };
};

export default function CartDrawer() {
  const { isOpen, closeCart } = useCart();
  const [items, setItems] = useState<DrawerItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const subtotal = items.reduce(
    (s, i) => s + Number(i.product.price) * i.quantity,
    0,
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-[70] bg-brand-surface border-l border-brand-border flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} strokeWidth={1.5} className="text-brand-caramel" />
            <span className="font-heading text-xl text-brand-white tracking-wide">YOUR CART</span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-brand-muted hover:text-brand-white transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <span className="font-body text-xs text-brand-muted tracking-[0.2em] uppercase">Loading…</span>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <p className="font-body text-sm text-brand-muted">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="font-body text-xs text-brand-caramel hover:text-brand-caramel-light tracking-[0.15em] uppercase transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b border-brand-border last:border-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 flex-shrink-0 bg-brand-card border border-brand-border flex items-center justify-center">
                    <span className="font-heading text-base text-brand-caramel leading-none">
                      {item.product.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs font-semibold text-brand-white leading-snug">
                      {item.product.name}
                    </p>
                    <p className="font-body text-[10px] text-brand-muted">{item.flavor}</p>
                    <p className="font-body text-[10px] text-brand-muted mt-0.5">Qty: {item.quantity}</p>
                  </div>

                  <span className="font-heading text-lg text-brand-white flex-shrink-0">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div className="px-6 py-5 border-t border-brand-border flex-shrink-0 space-y-3">
            <div className="flex justify-between items-center mb-4">
              <span className="font-body text-sm text-brand-muted">Subtotal</span>
              <span className="font-heading text-2xl text-brand-white">${subtotal.toFixed(2)}</span>
            </div>

            <a
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full bg-brand-flame hover:bg-brand-flame-dark text-white font-body text-xs font-semibold tracking-[0.2em] uppercase py-4 transition-colors"
            >
              Checkout
              <ArrowRight size={13} />
            </a>

            <a
              href="/cart"
              onClick={closeCart}
              className="block text-center font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-white transition-colors"
            >
              View Full Cart
            </a>
          </div>
        )}
      </div>
    </>
  );
}
