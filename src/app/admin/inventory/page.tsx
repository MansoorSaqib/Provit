import prisma from "@/lib/prisma";
import InventoryClient from "./InventoryClient";

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({
    include: { product: { select: { name: true, slug: true, isActive: true } } },
    orderBy: [{ product: { name: "asc" } }, { flavor: "asc" }],
  });

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">INVENTORY</h1>
        <p className="font-body text-sm text-brand-muted mt-1">
          {inventory.filter((i) => i.stock <= i.lowStockThreshold).length} items low on stock
        </p>
      </div>
      <InventoryClient inventory={JSON.parse(JSON.stringify(inventory))} />
    </div>
  );
}
