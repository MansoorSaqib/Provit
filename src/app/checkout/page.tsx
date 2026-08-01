import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

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
  if (items.length === 0) redirect("/cart");

  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="mb-10">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-2">Checkout</p>
          <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">
            COMPLETE ORDER
          </h1>
        </div>
        <CheckoutClient
          items={JSON.parse(JSON.stringify(items))}
          defaultEmail={profile.email}
          defaultPhone={profile.phone ?? ""}
        />
      </div>
    </div>
  );
}
