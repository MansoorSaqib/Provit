import prisma from "@/lib/prisma";

export default async function CustomersPage() {
  const customers = await prisma.profile.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
  });

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">CUSTOMERS</h1>
        <p className="font-body text-sm text-brand-muted mt-1">{customers.length} registered customers</p>
      </div>

      <div className="bg-brand-surface border border-brand-border">
        <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-brand-border">
          {["Name", "Email", "Joined", "Orders", "Spent"].map((h) => (
            <span key={h} className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">{h}</span>
          ))}
        </div>

        {customers.length === 0 && (
          <p className="text-center font-body text-sm text-brand-muted py-16">No customers yet</p>
        )}

        {customers.map((c) => {
          const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.total), 0);
          return (
            <div key={c.id} className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-1 lg:gap-4 px-5 py-4 border-b border-brand-border last:border-0 items-center hover:bg-brand-card transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-card border border-brand-border flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-sm text-brand-caramel leading-none">
                    {(c.name ?? c.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-body text-xs font-semibold text-brand-white truncate">{c.name ?? "—"}</span>
              </div>
              <span className="font-body text-xs text-brand-muted truncate">{c.email}</span>
              <span className="font-body text-xs text-brand-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
              <span className="font-heading text-xl text-brand-white">{c._count.orders}</span>
              <span className="font-heading text-xl text-brand-caramel">${totalSpent.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
