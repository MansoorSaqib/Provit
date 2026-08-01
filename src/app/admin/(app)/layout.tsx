import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import AdminSidebar from "../AdminSidebar";
import OrderNotifier from "@/components/admin/OrderNotifier";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const profile = await prisma.profile.findUnique({ where: { authId: user.id } });
  if (!profile || profile.role === "USER") redirect("/admin");

  return (
    <div className="min-h-screen flex">
      <AdminSidebar role={profile.role} name={profile.name ?? profile.email} email={profile.email} />
      <main className="flex-1 overflow-auto lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
      <OrderNotifier />
    </div>
  );
}
