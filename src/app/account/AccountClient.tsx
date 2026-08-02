"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUS_STYLES: Record<string, string> = {
  PENDING:    "text-yellow-400 bg-yellow-400/10 border-yellow-400/25",
  PROCESSING: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  SHIPPED:    "text-purple-400 bg-purple-400/10 border-purple-400/25",
  DELIVERED:  "text-green-400 bg-green-400/10 border-green-400/25",
  CANCELLED:  "text-red-400 bg-red-400/10 border-red-400/25",
  REFUNDED:   "text-orange-400 bg-orange-400/10 border-orange-400/25",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Order placed",
  PROCESSING: "Being prepared",
  SHIPPED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  items: { quantity: number; flavor: string; product: { name: string } }[];
};

type Profile = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
};

export default function AccountClient({
  profile,
  activeOrders,
  pastOrders,
  totalSpent,
}: {
  profile: Profile;
  activeOrders: Order[];
  pastOrders: Order[];
  totalSpent: number;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-2">My Account</p>
          <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">
            {profile.name ? profile.name.toUpperCase() : "DASHBOARD"}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted hover:text-brand-flame transition-colors border border-brand-border px-4 py-2 hover:border-brand-flame/30"
        >
          Sign out
        </button>
      </div>

      {/* Profile card + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border p-6 flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-brand-caramel/20 border border-brand-caramel/40 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-2xl text-brand-caramel leading-none">
              {(profile.name ?? profile.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-2xl text-brand-white tracking-wide mb-0.5">{profile.name ?? "—"}</p>
            <p className="font-body text-sm text-brand-muted mb-3">{profile.email}</p>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">
              Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-brand-surface border border-brand-border p-5">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-2">Total Orders</p>
            <p className="font-heading text-4xl text-brand-white">{activeOrders.length + pastOrders.length}</p>
          </div>
          <div className="bg-brand-surface border border-brand-border p-5">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-2">Total Spent</p>
            <p className="font-heading text-4xl text-brand-caramel">PKR {totalSpent.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-heading text-2xl text-brand-white tracking-wide">CURRENT ORDERS</h2>
            <span className="w-5 h-5 rounded-full bg-brand-flame flex items-center justify-center font-body text-[10px] text-white font-bold">{activeOrders.length}</span>
          </div>
          <div className="space-y-3">
            {activeOrders.map((o) => (
              <OrderCard key={o.id} order={o} active />
            ))}
          </div>
        </div>
      )}

      {/* Order history */}
      <div>
        <h2 className="font-heading text-2xl text-brand-white tracking-wide mb-4">ORDER HISTORY</h2>
        {pastOrders.length === 0 && activeOrders.length === 0 && (
          <div className="bg-brand-surface border border-brand-border p-10 text-center">
            <p className="font-body text-sm text-brand-muted mb-4">No orders yet.</p>
            <a
              href="/#products"
              className="inline-block font-body text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3 bg-brand-flame hover:bg-brand-flame-dark text-white transition-colors"
            >
              Shop Now
            </a>
          </div>
        )}
        {pastOrders.length === 0 && activeOrders.length > 0 && (
          <p className="font-body text-sm text-brand-muted">No completed orders yet.</p>
        )}
        {pastOrders.length > 0 && (
          <div className="space-y-3">
            {pastOrders.map((o) => (
              <OrderCard key={o.id} order={o} active={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, active }: { order: Order; active: boolean }) {
  return (
    <div className={`bg-brand-surface border p-5 ${active ? "border-brand-caramel/30" : "border-brand-border"}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-body text-xs font-semibold text-brand-white">
              #{order.orderNumber.slice(-8).toUpperCase()}
            </p>
            <span className={`font-body text-[9px] font-semibold tracking-[0.15em] uppercase px-2 py-0.5 border ${STATUS_STYLES[order.status]}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <p className="font-body text-[11px] text-brand-muted">
            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <span className="font-heading text-2xl text-brand-white flex-shrink-0">PKR {Number(order.total).toFixed(0)}</span>
      </div>

      {/* Progress bar for active orders */}
      {active && (
        <div className="mb-3">
          {(() => {
            const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
            const current = steps.indexOf(order.status);
            return (
              <div className="flex items-center gap-1">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`h-1 flex-1 rounded-full transition-all ${i <= current ? "bg-brand-caramel" : "bg-brand-border"}`} />
                    {i < steps.length - 1 && <div className="w-1" />}
                  </div>
                ))}
              </div>
            );
          })()}
          <div className="flex justify-between mt-1">
            {["Placed", "Processing", "Shipped", "Delivered"].map((l) => (
              <p key={l} className="font-body text-[9px] text-brand-muted">{l}</p>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-wrap gap-2">
        {order.items.map((item, i) => (
          <span key={i} className="font-body text-[10px] text-brand-muted border border-brand-border px-2 py-1">
            {item.quantity}× {item.product.name} ({item.flavor})
          </span>
        ))}
      </div>
    </div>
  );
}
