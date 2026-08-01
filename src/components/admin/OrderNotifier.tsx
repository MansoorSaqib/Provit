"use client";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, X } from "lucide-react";

function playOrderSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Two-tone ding: high note then slightly higher
    const tones: [number, number, number][] = [
      [830, 0,    0.28],
      [1046, 0.2, 0.38],
    ];

    tones.forEach(([freq, offset, dur]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.4, now + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
      osc.start(now + offset);
      osc.stop(now + offset + dur);
    });
  } catch {
    // AudioContext blocked until user gesture — silent fail
  }
}

export default function OrderNotifier() {
  const lastCount   = useRef<number | null>(null);
  const [toast, setToast]       = useState(false);
  const [incoming, setIncoming] = useState(0);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/admin/orders/count", { cache: "no-store" });
        if (!res.ok) return;
        const { count } = await res.json();

        if (lastCount.current !== null && count > lastCount.current) {
          const diff = count - lastCount.current;
          setIncoming(diff);
          setToast(true);
          playOrderSound();
          // Auto-dismiss after 5 s
          setTimeout(() => setToast(false), 5000);
        }
        lastCount.current = count;
      } catch { /* network error — skip */ }
    }

    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] transition-all duration-400 ease-out ${
        toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-brand-caramel shadow-2xl px-5 py-3.5 min-w-[220px]">
        <ShoppingBag size={16} className="text-white flex-shrink-0" />
        <div className="flex-1">
          <p className="font-heading text-white text-lg leading-none tracking-wide">
            NEW ORDER{incoming > 1 ? "S" : ""}
          </p>
          <p className="font-body text-white/80 text-[10px] tracking-[0.1em] mt-0.5">
            {incoming} order{incoming > 1 ? "s" : ""} just came in
          </p>
        </div>
        <button
          onClick={() => setToast(false)}
          className="text-white/60 hover:text-white transition-colors ml-1"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
