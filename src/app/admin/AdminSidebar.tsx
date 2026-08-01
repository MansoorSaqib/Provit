"use client";
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const allLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "▣", adminOnly: true },
  { href: "/admin/orders", label: "Orders", icon: "◎", adminOnly: false },
  { href: "/admin/products", label: "Products", icon: "◈", adminOnly: false },
  { href: "/admin/inventory", label: "Inventory", icon: "◉", adminOnly: false },
  { href: "/admin/customers", label: "Customers", icon: "◐", adminOnly: false },
  { href: "/admin/staff", label: "Staff", icon: "◑", adminOnly: true },
];

export default function AdminSidebar({
  role,
  name,
  email,
}: {
  role: string;
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";

  const links = allLinks.filter((l) => !l.adminOnly || isAdmin);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-border">
        <a href="/">
          <Image src="/logo.png" alt="PROVIT" width={110} height={73} className="w-24 object-contain" />
        </a>
        <p className="font-body text-[9px] tracking-[0.25em] uppercase text-brand-muted mt-1">
          {isAdmin ? "Admin Panel" : "Staff Panel"}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 font-body text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-150 ${
                active
                  ? "bg-brand-caramel/15 text-brand-caramel border-l-2 border-brand-caramel"
                  : "text-brand-muted hover:text-brand-white hover:bg-brand-card border-l-2 border-transparent"
              }`}
            >
              <span className="text-base leading-none">{l.icon}</span>
              {l.label}
            </a>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-5 border-t border-brand-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-brand-caramel/20 border border-brand-caramel/40 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-sm text-brand-caramel leading-none">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-body text-xs font-semibold text-brand-white truncate">{name}</p>
            <p className="font-body text-[10px] text-brand-muted truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted hover:text-brand-flame transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-brand-surface border-b border-brand-border px-4 py-3 flex items-center justify-between">
        <Image src="/logo.png" alt="PROVIT" width={80} height={53} className="w-20 object-contain" />
        <button onClick={() => setOpen((v) => !v)} className="text-brand-white p-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path d="M4 4l12 12M4 16L16 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            ) : (
              <>
                <rect y="3" width="20" height="1.5" rx="1" />
                <rect y="9" width="20" height="1.5" rx="1" />
                <rect y="15" width="20" height="1.5" rx="1" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 pt-14">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full bg-brand-surface border-r border-brand-border">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-brand-surface border-r border-brand-border z-20">
        <SidebarContent />
      </aside>
    </>
  );
}
