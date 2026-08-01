import prisma from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { inventory: true, _count: { select: { orderItems: true } } },
  });

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">PRODUCTS</h1>
        <p className="font-body text-sm text-brand-muted mt-1">{products.length} products</p>
      </div>
      <ProductsClient products={JSON.parse(JSON.stringify(products))} />
    </div>
  );
}
