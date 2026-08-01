"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }

    const res = await fetch("/api/me");
    const profile = await res.json();

    if (profile.role === "STAFF") {
      router.push("/admin/orders");
      router.refresh();
    } else if (profile.role === "ADMIN") {
      await supabase.auth.signOut();
      setError("Admin accounts must use the admin login page.");
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      setError("You do not have staff access.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 relative overflow-hidden border-r border-brand-border">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 20% 60%, rgba(59,130,246,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(200,131,42,0.08) 0%, transparent 50%)",
        }} />
        <div className="relative z-10">
          <p className="font-body text-[10px] tracking-[0.35em] uppercase text-blue-400 mb-1">Provit</p>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">Staff Portal</p>
        </div>
        <div className="relative z-10">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-8">Team access</p>
          <h1 className="font-heading leading-none text-brand-white" style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}>
            BUILT
            <br />
            TO
            <br />
            <span style={{
              backgroundImage: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              DELIVER.
            </span>
          </h1>
        </div>
        <p className="relative z-10 font-body text-xs text-brand-muted">
          Staff credentials are issued by your administrator. Contact them if you need access.
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
          <h2 className="font-heading text-5xl text-brand-white mb-2 tracking-wide">STAFF LOGIN</h2>
          <p className="font-body text-sm text-brand-muted mb-10">
            Admin?{" "}
            <a href="/admin" className="text-brand-caramel hover:text-brand-caramel-light transition-colors">
              Use the admin portal →
            </a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-muted block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="staff@provit.site"
                className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-blue-500 transition-colors placeholder:text-brand-muted/40"
              />
            </div>
            <div>
              <label className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-muted block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-blue-500 transition-colors placeholder:text-brand-muted/40"
              />
            </div>

            {error && (
              <p className="font-body text-xs text-brand-flame bg-brand-flame/10 border border-brand-flame/20 px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-body text-xs font-semibold tracking-[0.25em] uppercase py-4 transition-colors duration-200 cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign In to Staff Portal"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-brand-border">
            <a href="/" className="font-body text-xs text-brand-muted hover:text-brand-white transition-colors tracking-[0.1em] uppercase">
              ← Back to site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
