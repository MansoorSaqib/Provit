"use client";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "../../actions";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
type Status = typeof STATUSES[number];

const STATUS_COLORS: Record<Status, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  PROCESSING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  SHIPPED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  DELIVERED: "text-green-400 bg-green-400/10 border-green-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
  REFUNDED: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

type Order = {
  id: string;
  orderNumber: string;
  status: Status;
  total: string;
  createdAt: string;
  profile: { name: string | null; email: string };
  items: { quantity: number; product: { name: string }; flavor: string; priceAtPurchase: string }[];
};

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  function handleStatus(orderId: string, status: Status) {
    startTransition(() => updateOrderStatus(orderId, status));
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["ALL", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`font-body text-[10px] font-semibold tracking-[0.15em] uppercase px-4 py-2 border transition-colors ${
              filter === s
                ? "border-brand-caramel text-brand-caramel bg-brand-caramel/10"
                : "border-brand-border text-brand-muted hover:text-brand-white hover:border-brand-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-brand-surface border border-brand-border">
        {filtered.length === 0 && (
          <p className="text-center font-body text-sm text-brand-muted py-16">No orders found</p>
        )}
        {filtered.map((o) => (
          <div key={o.id} className="border-b border-brand-border last:border-0">
            {/* Row */}
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-brand-card transition-colors"
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <p className="font-body text-xs font-semibold text-brand-white">
                    #{o.orderNumber.slice(-8).toUpperCase()}
                  </p>
                  <span className={`font-body text-[9px] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 border ${STATUS_COLORS[o.status]}`}>
                    {o.status}
                  </span>
                </div>
                <p className="font-body text-[11px] text-brand-muted">
                  {o.profile.name ?? o.profile.email} · {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-heading text-xl text-brand-white">PKR {Number(o.total).toFixed(0)}</span>
                <span className="text-brand-muted text-xs">{expanded === o.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === o.id && (
              <div className="px-5 pb-5 bg-brand-card border-t border-brand-border">
                <div className="mt-4 mb-4">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-3">Items</p>
                  <div className="space-y-2">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex justify-between font-body text-xs text-brand-white">
                        <span>{item.quantity}× {item.product.name} ({item.flavor})</span>
                        <span>PKR {(Number(item.priceAtPurchase) * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-2">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={pending || o.status === s}
                        onClick={() => handleStatus(o.id, s)}
                        className={`font-body text-[9px] font-semibold tracking-[0.1em] uppercase px-3 py-1.5 border transition-colors disabled:opacity-40 disabled:cursor-default ${
                          o.status === s
                            ? STATUS_COLORS[s]
                            : "border-brand-border text-brand-muted hover:border-brand-white hover:text-brand-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
