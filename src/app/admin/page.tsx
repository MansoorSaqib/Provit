import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  // Already logged-in admins skip straight to the dashboard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const profile = await prisma.profile.findUnique({ where: { authId: user.id } });
    if (profile?.role === "ADMIN") redirect("/admin/dashboard");
    if (profile?.role === "STAFF") redirect("/admin/orders");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 relative overflow-hidden border-r border-brand-border">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 20% 60%, rgba(200,131,42,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(232,82,42,0.08) 0%, transparent 50%)",
        }} />
        <div className="relative z-10">
          <p className="font-body text-[10px] tracking-[0.35em] uppercase text-brand-caramel mb-1">Provit</p>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">Admin Portal</p>
        </div>
        <div className="relative z-10">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-8">Restricted access</p>
          <h1 className="font-heading leading-none text-brand-white" style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}>
            MANAGE
            <br />
            WITH
            <br />
            <span style={{
              backgroundImage: "linear-gradient(135deg, #E4A854 0%, #E8522A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              POWER.
            </span>
          </h1>
        </div>
        <p className="relative z-10 font-body text-xs text-brand-muted">
          Admin accounts are invite-only. Contact your system administrator.
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <AdminLoginForm />
      </div>
    </div>
  );
}
