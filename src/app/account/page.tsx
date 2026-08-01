import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import AccountClient from "./AccountClient";
import Navbar from "@/components/Navbar";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const profile = await prisma.profile.upsert({
    where: { authId: user.id },
    create: {
      authId: user.id,
      email: user.email!,
      name: (user.user_metadata?.name as string | undefined) ?? null,
    },
    update: {},
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: { select: { name: true } } } } },
      },
    },
  });

  const activeStatuses = ["PENDING", "PROCESSING", "SHIPPED"];
  const activeOrders = profile.orders.filter((o) => activeStatuses.includes(o.status));
  const pastOrders = profile.orders.filter((o) => !activeStatuses.includes(o.status));
  const totalSpent = profile.orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        <AccountClient
          profile={JSON.parse(JSON.stringify(profile))}
          activeOrders={JSON.parse(JSON.stringify(activeOrders))}
          pastOrders={JSON.parse(JSON.stringify(pastOrders))}
          totalSpent={totalSpent}
        />
      </div>
    </div>
  );
}
