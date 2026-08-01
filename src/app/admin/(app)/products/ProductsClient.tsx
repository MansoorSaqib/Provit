"use client";
import { useTransition } from "react";
import { toggleProductActive } from "../../actions";

type Product = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  price: string;
  isActive: boolean;
  inventory: { flavor: string; stock: number }[];
  _count: { orderItems: number };
};

export default function ProductsClient({ products }: { products: Product[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {products.map((p) => {
        const totalStock = p.inventory.reduce((sum, i) => sum + i.stock, 0);
        return (
          <div key={p.id} className={`bg-brand-surface border p-5 ${p.isActive ? "border-brand-border" : "border-brand-border opacity-60"}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-2xl text-brand-white tracking-wide">{p.name}</h3>
                  <span className={`font-body text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border ${
                    p.isActive ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-brand-muted border-brand-border"
                  }`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {p.tagline && <p className="font-body text-xs text-brand-muted">{p.tagline}</p>}
              </div>
              <span className="font-heading text-3xl text-brand-caramel flex-shrink-0">${Number(p.price).toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-brand-card p-3">
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-1">Stock</p>
                <p className="font-heading text-2xl text-brand-white">{totalStock}</p>
              </div>
              <div className="bg-brand-card p-3">
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-1">Flavors</p>
                <p className="font-heading text-2xl text-brand-white">{p.inventory.length}</p>
              </div>
              <div className="bg-brand-card p-3">
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-1">Orders</p>
                <p className="font-heading text-2xl text-brand-white">{p._count.orderItems}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {p.inventory.map((inv) => (
                  <span key={inv.flavor} className="font-body text-[10px] text-brand-muted border border-brand-border px-2 py-0.5">
                    {inv.flavor}: {inv.stock}
                  </span>
                ))}
              </div>
              <button
                disabled={pending}
                onClick={() => startTransition(() => toggleProductActive(p.id, !p.isActive))}
                className={`font-body text-[10px] tracking-[0.15em] uppercase px-4 py-2 border transition-colors disabled:opacity-40 ${
                  p.isActive
                    ? "border-brand-border text-brand-muted hover:border-red-400/50 hover:text-red-400"
                    : "border-green-400/30 text-green-400 hover:bg-green-400/10"
                }`}
              >
                {p.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
