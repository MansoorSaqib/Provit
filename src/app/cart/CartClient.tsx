"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  quantity: number;
  flavor: string;
  product: { id: string; name: string; price: string; slug: string };
};

export default function CartClient({ items: initial, total: initialTotal }: { items: CartItem[]; total: number }) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const total = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);

  async function updateQty(itemId: string, quantity: number) {
    if (quantity < 1) return removeItem(itemId);
    setLoading(itemId);
    await fetch(`/api/cart/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }), headers: { "Content-Type": "application/json" } });
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
    setLoading(null);
  }

  async function removeItem(itemId: string) {
    setLoading(itemId);
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setLoading(null);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-sm text-brand-muted mb-6">Your cart is empty.</p>
        <a href="/#products" className="inline-block font-body text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 bg-brand-flame hover:bg-brand-flame-dark text-white transition-colors">
          Shop Now
        </a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`bg-brand-surface border border-brand-border p-5 flex items-center gap-5 transition-opacity ${loading === item.id ? "opacity-40" : ""}`}>
            {/* Color swatch */}
            <div className="w-12 h-12 flex-shrink-0 bg-brand-card border border-brand-border flex items-center justify-center">
              <span className="font-heading text-lg text-brand-caramel leading-none">
                {item.product.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-body text-xs font-semibold text-brand-white">{item.product.name}</p>
              <p className="font-body text-[10px] text-brand-muted">{item.flavor}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                disabled={!!loading}
                className="w-7 h-7 border border-brand-border text-brand-white hover:border-brand-muted flex items-center justify-center font-body text-sm transition-colors disabled:opacity-40"
              >
                −
              </button>
              <span className="font-heading text-xl text-brand-white w-6 text-center leading-none">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                disabled={!!loading}
                className="w-7 h-7 border border-brand-border text-brand-white hover:border-brand-muted flex items-center justify-center font-body text-sm transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>

            {/* Price */}
            <span className="font-heading text-2xl text-brand-white flex-shrink-0 w-16 text-right">
              ${(Number(item.product.price) * item.quantity).toFixed(2)}
            </span>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.id)}
              disabled={!!loading}
              className="text-brand-muted hover:text-brand-flame transition-colors font-body text-xs disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-brand-surface border border-brand-border p-6 h-fit sticky top-24">
        <h2 className="font-heading text-2xl text-brand-white tracking-wide mb-5">ORDER SUMMARY</h2>

        <div className="space-y-3 mb-5 pb-5 border-b border-brand-border">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between font-body text-xs text-brand-muted">
              <span>{item.quantity}× {item.product.name}</span>
              <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mb-6">
          <span className="font-body text-sm font-semibold text-brand-white">Total</span>
          <span className="font-heading text-3xl text-brand-white">${total.toFixed(2)}</span>
        </div>

        <a href="/checkout" className="block w-full bg-brand-flame hover:bg-brand-flame-dark text-white font-body text-xs font-semibold tracking-[0.25em] uppercase py-4 transition-colors mb-3 text-center">
          Proceed to Checkout
        </a>
        <a href="/#products" className="block text-center font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-white transition-colors">
          Continue Shopping
        </a>
      </div>
    </div>
  );
}
