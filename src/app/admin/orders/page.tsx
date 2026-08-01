import prisma from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">ORDERS</h1>
        <p className="font-body text-sm text-brand-muted mt-1">{orders.length} total orders</p>
      </div>
      <OrdersClient orders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
