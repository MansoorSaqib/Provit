import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

async function getStats() {
  const [totalOrders, revenueResult, totalCustomers, recentOrders, lowStock, ordersByStatus] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.profile.count({ where: { role: "USER" } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { profile: { select: { name: true, email: true } } },
      }),
      prisma.inventory.findMany({
        where: { stock: { lte: 10 } },
        include: { product: { select: { name: true } } },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

  return { totalOrders, revenue: revenueResult._sum.total ?? 0, totalCustomers, recentOrders, lowStock, ordersByStatus };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  PROCESSING: "text-blue-400 bg-blue-400/10",
  SHIPPED: "text-purple-400 bg-purple-400/10",
  DELIVERED: "text-green-400 bg-green-400/10",
  CANCELLED: "text-red-400 bg-red-400/10",
  REFUNDED: "text-orange-400 bg-orange-400/10",
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { authId: user.id } });
  if (profile?.role !== "ADMIN") redirect("/admin/orders");
  const { totalOrders, revenue, totalCustomers, recentOrders, ordersByStatus } = await getStats();

  const stats = [
    { label: "Total Revenue", value: `$${Number(revenue).toFixed(2)}`, sub: "All time" },
    { label: "Total Orders", value: totalOrders.toString(), sub: "All time" },
    { label: "Customers", value: totalCustomers.toString(), sub: "Registered" },
    { label: "Products", value: "4", sub: "Active" },
  ];

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">DASHBOARD</h1>
        <p className="font-body text-sm text-brand-muted mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-brand-surface border border-brand-border p-5">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-3">{s.label}</p>
            <p className="font-heading text-4xl text-brand-white leading-none mb-1">{s.value}</p>
            <p className="font-body text-[10px] text-brand-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <h2 className="font-heading text-xl text-brand-white tracking-wide">RECENT ORDERS</h2>
            <a href="/admin/orders" className="font-body text-[10px] tracking-[0.15em] uppercase text-brand-caramel hover:text-brand-caramel-light transition-colors">
              View all →
            </a>
          </div>
          <div className="divide-y divide-brand-border">
            {recentOrders.length === 0 && (
              <p className="px-5 py-8 font-body text-sm text-brand-muted text-center">No orders yet</p>
            )}
            {recentOrders.map((o) => (
              <div key={o.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-body text-xs font-semibold text-brand-white truncate">
                    {o.profile.name ?? o.profile.email}
                  </p>
                  <p className="font-body text-[10px] text-brand-muted">
                    #{o.orderNumber.slice(-8).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-body text-[9px] font-semibold tracking-[0.15em] uppercase px-2 py-1 ${STATUS_COLORS[o.status] ?? ""}`}>
                    {o.status}
                  </span>
                  <span className="font-heading text-lg text-brand-white">${Number(o.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-brand-surface border border-brand-border">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-heading text-xl text-brand-white tracking-wide">ORDER STATUS</h2>
          </div>
          <div className="p-5 space-y-3">
            {ordersByStatus.length === 0 && (
              <p className="font-body text-sm text-brand-muted text-center py-4">No orders yet</p>
            )}
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={`font-body text-[10px] font-semibold tracking-[0.15em] uppercase px-2 py-1 ${STATUS_COLORS[s.status] ?? ""}`}>
                  {s.status}
                </span>
                <span className="font-heading text-2xl text-brand-white">{s._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
