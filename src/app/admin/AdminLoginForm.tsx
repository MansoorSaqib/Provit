"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
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
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }

    // Fetch profile to check role
    const res = await fetch("/api/me");
    const profile = await res.json();

    if (profile.role === "ADMIN") {
      router.push("/admin/dashboard");
      router.refresh();
    } else if (profile.role === "STAFF") {
      await supabase.auth.signOut();
      setError("Staff accounts must use the staff login page.");
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      setError("You do not have admin access.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="font-heading text-5xl text-brand-white mb-2 tracking-wide">ADMIN LOGIN</h2>
      <p className="font-body text-sm text-brand-muted mb-10">
        Staff?{" "}
        <a href="/staff-login" className="text-brand-caramel hover:text-brand-caramel-light transition-colors">
          Use the staff portal →
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
            placeholder="admin@provit.site"
            className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
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
            className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
          />
        </div>

        {error && (
          <p className="font-body text-xs text-brand-flame bg-brand-flame/10 border border-brand-flame/20 px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-caramel hover:bg-brand-caramel-light disabled:opacity-50 text-white font-body text-xs font-semibold tracking-[0.25em] uppercase py-4 transition-colors duration-200 cursor-pointer"
        >
          {loading ? "Signing in…" : "Sign In to Admin"}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-brand-border">
        <a href="/" className="font-body text-xs text-brand-muted hover:text-brand-white transition-colors tracking-[0.1em] uppercase">
          ← Back to site
        </a>
      </div>
    </div>
  );
}
