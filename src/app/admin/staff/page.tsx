import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import StaffClient from "./StaffClient";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const me = await prisma.profile.findUnique({ where: { authId: user.id } });
  if (me?.role !== "ADMIN") redirect("/admin/orders");

  const staff = await prisma.profile.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-heading text-4xl lg:text-5xl text-brand-white tracking-wide">STAFF</h1>
        <p className="font-body text-sm text-brand-muted mt-1">{staff.length} team members</p>
      </div>
      <StaffClient staff={JSON.parse(JSON.stringify(staff))} currentId={me.id} />
    </div>
  );
}
