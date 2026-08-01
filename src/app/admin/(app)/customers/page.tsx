import prisma from "@/lib/prisma";
import { MapPin, Phone, Mail, ShoppingBag } from "lucide-react";

export default async function CustomersPage() {
  const customers = await prisma.profile.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
      addresses: {
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">CUSTOMERS</h1>
        <p className="font-body text-sm text-brand-muted mt-1">{customers.length} registered customers</p>
      </div>

      {customers.length === 0 && (
        <div className="bg-brand-surface border border-brand-border p-16 text-center">
          <p className="font-body text-sm text-brand-muted">No customers yet</p>
        </div>
      )}

      <div className="space-y-3">
        {customers.map((c) => {
          const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.total), 0);
          const addr = c.addresses[0] ?? null;

          return (
            <div key={c.id} className="bg-brand-surface border border-brand-border p-5 hover:border-brand-border/60 transition-colors">
              {/* Top row — name / avatar + order stats */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center flex-shrink-0">
                    <span className="font-heading text-lg text-brand-caramel leading-none">
                      {(c.name ?? c.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-brand-white truncate">
                      {c.name ?? "—"}
                    </p>
                    <p className="font-body text-[10px] text-brand-muted">
                      Joined {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-body text-[10px] uppercase tracking-[0.15em] text-brand-muted mb-0.5">Orders</p>
                    <div className="flex items-center gap-1 justify-end">
                      <ShoppingBag size={12} className="text-brand-muted" />
                      <span className="font-heading text-2xl text-brand-white leading-none">{c._count.orders}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-[10px] uppercase tracking-[0.15em] text-brand-muted mb-0.5">Spent</p>
                    <span className="font-heading text-2xl text-brand-caramel leading-none">${totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Contact + address row */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-brand-border">
                {/* Email */}
                <div className="flex items-start gap-2">
                  <Mail size={13} className="text-brand-muted mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-body text-[9px] uppercase tracking-[0.15em] text-brand-muted mb-0.5">Email</p>
                    <p className="font-body text-xs text-brand-white truncate">{c.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-2">
                  <Phone size={13} className="text-brand-muted mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-body text-[9px] uppercase tracking-[0.15em] text-brand-muted mb-0.5">Phone</p>
                    <p className="font-body text-xs text-brand-white">
                      {addr?.phone ?? c.phone ?? <span className="text-brand-muted">—</span>}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-1">
                  <MapPin size={13} className="text-brand-muted mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-body text-[9px] uppercase tracking-[0.15em] text-brand-muted mb-0.5">Last Address</p>
                    {addr ? (
                      <p className="font-body text-xs text-brand-white leading-relaxed">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                        {addr.city}, {addr.state} {addr.postalCode}<br />
                        {addr.country}
                      </p>
                    ) : (
                      <p className="font-body text-xs text-brand-muted">No address yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
