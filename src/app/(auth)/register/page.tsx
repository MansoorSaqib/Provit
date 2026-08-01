"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If session exists the user is auto-confirmed — redirect to account
    if (data.session) {
      router.push("/account");
      router.refresh();
    } else {
      // Email confirmation required
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-brand-caramel/20 border border-brand-caramel/40 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8832A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-heading text-4xl text-brand-white mb-3 tracking-wide">CHECK YOUR EMAIL</h2>
        <p className="font-body text-sm text-brand-muted leading-relaxed mb-8">
          We sent a confirmation link to <span className="text-brand-white">{email}</span>. Click it to activate your account.
        </p>
        <a
          href="/login"
          className="inline-block font-body text-xs font-semibold tracking-[0.25em] uppercase text-brand-caramel hover:text-brand-caramel-light transition-colors"
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="lg:hidden mb-10">
        <Image src="/logo.png" alt="PROVIT" width={120} height={80} className="w-28 object-contain" />
      </div>

      <h2 className="font-heading text-5xl text-brand-white mb-2 tracking-wide">CREATE ACCOUNT</h2>
      <p className="font-body text-sm text-brand-muted mb-10">
        Already have one?{" "}
        <a href="/login" className="text-brand-caramel hover:text-brand-caramel-light transition-colors">
          Sign in
        </a>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-muted block mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Smith"
            className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
          />
        </div>

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
            placeholder="Min. 8 characters"
            className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
          />
        </div>

        <div>
          <label className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-muted block mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-brand-surface border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
          />
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
          {loading ? "Creating account…" : "Create Account"}
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

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 relative overflow-hidden border-r border-brand-border">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 40%, rgba(232,82,42,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(200,131,42,0.1) 0%, transparent 50%)",
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
            Join the movement
          </p>
          <h1
            className="font-heading leading-none text-brand-white"
            style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
          >
            START
            <br />
            YOUR
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #E8522A 0%, #C03018 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              JOURNEY.
            </span>
          </h1>
        </div>
        <p className="relative z-10 font-body text-xs text-brand-muted leading-relaxed max-w-xs">
          Track orders, save addresses, and fuel your performance — all in one place.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
