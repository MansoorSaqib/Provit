"use client";
import { useState, useTransition } from "react";
import { updateInventoryStock } from "../../actions";

type InventoryItem = {
  id: string;
  flavor: string;
  stock: number;
  lowStockThreshold: number;
  sku: string | null;
  product: { name: string; slug: string; isActive: boolean };
};

export default function InventoryClient({ inventory }: { inventory: InventoryItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  function startEdit(item: InventoryItem) {
    setEditing(item.id);
    setValues((v) => ({ ...v, [item.id]: item.stock }));
  }

  function saveEdit(id: string) {
    const newStock = values[id];
    if (newStock === undefined) return;
    startTransition(async () => {
      await updateInventoryStock(id, newStock);
      setEditing(null);
    });
  }

  return (
    <div className="bg-brand-surface border border-brand-border">
      {/* Header */}
      <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-5 py-3 border-b border-brand-border">
        {["Product", "Flavor", "SKU", "Stock", ""].map((h) => (
          <span key={h} className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">{h}</span>
        ))}
      </div>

      {inventory.map((item) => {
        const isLow = item.stock <= item.lowStockThreshold;
        return (
          <div
            key={item.id}
            className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_120px] gap-2 lg:gap-4 px-5 py-4 border-b border-brand-border last:border-0 items-center"
          >
            <div>
              <p className="font-body text-xs font-semibold text-brand-white">{item.product.name}</p>
              {!item.product.isActive && (
                <span className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-muted bg-brand-border px-1.5 py-0.5">Inactive</span>
              )}
            </div>
            <span className="font-body text-xs text-brand-muted lg:text-brand-white">{item.flavor}</span>
            <span className="font-body text-[11px] text-brand-muted">{item.sku ?? "—"}</span>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {editing === item.id ? (
                <input
                  type="number"
                  min={0}
                  value={values[item.id] ?? item.stock}
                  onChange={(e) => setValues((v) => ({ ...v, [item.id]: Number(e.target.value) }))}
                  className="w-20 bg-brand-card border border-brand-caramel text-brand-white font-body text-sm px-2 py-1 outline-none"
                  autoFocus
                />
              ) : (
                <span className={`font-heading text-2xl leading-none ${isLow ? "text-brand-flame" : "text-brand-white"}`}>
                  {item.stock}
                </span>
              )}
              {isLow && editing !== item.id && (
                <span className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-flame border border-brand-flame/30 px-1.5 py-0.5">Low</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {editing === item.id ? (
                <>
                  <button
                    disabled={pending}
                    onClick={() => saveEdit(item.id)}
                    className="font-body text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 bg-brand-caramel text-white hover:bg-brand-caramel-light transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="font-body text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border border-brand-border text-brand-muted hover:text-brand-white transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEdit(item)}
                  className="font-body text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border border-brand-border text-brand-muted hover:text-brand-white hover:border-brand-muted transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
