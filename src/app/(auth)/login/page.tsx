"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(next);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="lg:hidden mb-10">
        <Image src="/logo.png" alt="PROVIT" width={120} height={80} className="w-28 object-contain" />
      </div>

      <h2 className="font-heading text-5xl text-brand-white mb-2 tracking-wide">SIGN IN</h2>
      <p className="font-body text-sm text-brand-muted mb-10">
        No account?{" "}
        <a href="/register" className="text-brand-caramel hover:text-brand-caramel-light transition-colors">
          Create one
        </a>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-muted block mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
          />
        </div>

        <div>
          <label className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-muted block mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
          />
          <div className="mt-2 text-right">
            <a href="/forgot-password" className="font-body text-[10px] text-brand-muted hover:text-brand-white transition-colors tracking-[0.1em] uppercase">
              Forgot password?
            </a>
          </div>
        </div>

        {error && (
          <p className="font-body text-xs text-brand-flame bg-brand-flame/10 border border-brand-flame/20 px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-flame hover:bg-brand-flame-dark disabled:opacity-50 text-white font-body text-xs font-semibold tracking-[0.25em] uppercase py-4 transition-colors duration-200 cursor-pointer"
        >
          {loading ? "Signing in…" : "Sign In"}
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

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 relative overflow-hidden border-r border-brand-border">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 60%, rgba(200,131,42,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(232,82,42,0.08) 0%, transparent 50%)",
          }}
        />
        <Image
          src="/logo.png"
          alt="PROVIT"
          width={150}
          height={100}
          className="relative z-10 w-36 object-contain"
          priority
        />
        <div className="relative z-10">
          <p className="font-body text-[10px] tracking-[0.35em] uppercase text-brand-muted mb-8">
            Welcome back
          </p>
          <h1
            className="font-heading leading-none text-brand-white"
            style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
          >
            FUEL
            <br />
            YOUR
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #E4A854 0%, #E8522A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              FIRE.
            </span>
          </h1>
        </div>
        <p className="relative z-10 font-body text-xs text-brand-muted leading-relaxed max-w-xs">
          Premium protein bars for athletes who refuse to settle.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
