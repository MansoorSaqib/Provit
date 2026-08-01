import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import CartClient from "./CartClient";
import Navbar from "@/components/Navbar";

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cart");

  const profile = await prisma.profile.upsert({
    where: { authId: user.id },
    create: {
      authId: user.id,
      email: user.email!,
      name: (user.user_metadata?.name as string | undefined) ?? null,
    },
    update: {},
  });

  const cart = await prisma.cart.findUnique({
    where: { profileId: profile.id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, price: true, slug: true } } },
        orderBy: { id: "asc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const total = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);

  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="mb-8">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-2">My Cart</p>
          <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">
            {items.length === 0 ? "EMPTY CART" : `${items.length} ITEM${items.length > 1 ? "S" : ""}`}
          </h1>
        </div>
        <CartClient items={JSON.parse(JSON.stringify(items))} total={total} />
      </div>
    </div>
  );
}
