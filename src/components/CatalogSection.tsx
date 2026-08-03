"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price: number;
  images: string[];
  discountEnabled: boolean;
  discountType: string | null;
  discountValue: number | null;
  discountEndsAt: string | null;
  stock: number;
};

const SLUG_GRADIENTS: Record<string, { from: string; to: string; mid: string }> = {
  "caramel-crunch":   { from: "#8B5B1A", to: "#C8832A", mid: "#E4A854" },
  "dark-choco-fudge": { from: "#0D0500", to: "#3A1500", mid: "#6B3010" },
  "strawberry-blaze": { from: "#8B1A0D", to: "#CC3B1E", mid: "#E8522A" },
  "peanut-butter-pro":{ from: "#3B2010", to: "#7A4F28", mid: "#9B6B3A" },
};
const DEFAULT_GRADIENT = { from: "#1C1C1C", to: "#2A2A2A", mid: "#3A3A3A" };

function getEffectivePrice(p: CatalogProduct): { display: number; original: number | null } {
  const now = new Date();
  const active =
    p.discountEnabled &&
    p.discountValue != null &&
    (!p.discountEndsAt || new Date(p.discountEndsAt) > now);

  if (!active || p.discountValue == null) return { display: p.price, original: null };

  const effective =
    p.discountType === "PERCENT"
      ? p.price * (1 - p.discountValue / 100)
      : p.price - p.discountValue;

  return { display: Math.max(0, effective), original: p.price };
}

function ProductCard({ p, i }: { p: CatalogProduct; i: number }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { openCart, setCartCount } = useCart();

  const gradient = SLUG_GRADIENTS[p.slug] ?? DEFAULT_GRADIENT;
  const { display: effectivePrice, original: originalPrice } = getEffectivePrice(p);
  const hasImage = p.images.length > 0;
  const isOnSale = originalPrice !== null;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/login?next=/#products`;
      return;
    }

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: p.slug }),
    });

    setLoading(false);
    setAdded(true);
    setCartCount((prev) => prev + 1);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      className="relative overflow-hidden group cursor-pointer"
      style={{
        background: hasImage
          ? "#0A0A0A"
          : `linear-gradient(170deg, ${gradient.from} 0%, ${gradient.to} 60%, ${gradient.mid} 100%)`,
        height: "clamp(420px, 55vh, 580px)",
      }}
    >
      {/* Badge */}
      {isOnSale && (
        <div className="absolute top-5 left-5 z-20 px-3 py-1 font-body text-[9px] font-bold text-white tracking-[0.2em] uppercase bg-brand-flame">
          SALE
        </div>
      )}

      {/* Giant watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="font-heading select-none text-white leading-none tracking-widest"
          style={{
            fontSize: "clamp(5rem, 14vw, 12rem)",
            opacity: hasImage ? 0.03 : 0.06,
            whiteSpace: "nowrap",
          }}
        >
          {p.name.split(" ")[0].toUpperCase()}
        </span>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hasImage ? (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain object-center transform group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-500 ease-out p-10"
          />
        ) : (
          <div className="transform group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-500 ease-out">
            <div
              className="w-44 h-16 rounded-2xl relative overflow-hidden shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <span className="font-heading text-white text-base tracking-[0.3em] drop-shadow-lg">
                  PRO<span className="opacity-50">VIT</span>
                </span>
                <span className="font-body text-white/50 text-[8px] tracking-[0.25em] uppercase">
                  {p.name}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-6"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
        }}
      >
        <p className="font-body text-white/50 text-[10px] tracking-[0.2em] uppercase mb-1">
          {p.tagline ?? ""}
        </p>
        <h3 className="font-heading text-2xl text-white tracking-wide mb-4 leading-tight">
          {p.name}
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex flex-col leading-none">
            {isOnSale && (
              <span className="font-body text-white/40 text-xs line-through mb-0.5">
                PKR {originalPrice!.toFixed(0)}
              </span>
            )}
            <span className="font-heading text-3xl text-white">
              PKR {effectivePrice.toFixed(0)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 font-body font-semibold text-[10px] tracking-[0.2em] uppercase transition-all duration-200 disabled:opacity-70"
            style={{
              background: added ? "rgba(34,197,94,0.9)" : "rgba(232,82,42,0.9)",
              backdropFilter: "blur(8px)",
              color: "white",
            }}
          >
            <ShoppingCart size={13} />
            {loading ? "…" : added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CatalogSection({ products }: { products: CatalogProduct[] }) {
  return (
    <section id="products" className="py-32 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-body text-[10px] font-semibold text-brand-flame tracking-[0.4em] uppercase mb-4"
            >
              Our Products
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-[clamp(3rem,8vw,6.5rem)] text-brand-white leading-none tracking-wider"
            >
              PICK YOUR<br />
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #C8832A, #E8522A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                FLAVOR
              </span>
            </motion.h2>
          </div>

          <motion.a
            href="#"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group self-start lg:self-auto inline-flex items-center gap-2 font-body text-xs text-brand-muted tracking-[0.2em] uppercase hover:text-brand-white transition-colors duration-200"
          >
            View All Products
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
          </motion.a>
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-brand-muted font-body text-sm">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
        )}

        {/* Bundle strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-brand-border pt-8"
        >
          <div>
            <span className="font-body text-[10px] font-semibold text-brand-flame tracking-[0.3em] uppercase block mb-1">
              Best Value
            </span>
            <h4 className="font-heading text-2xl lg:text-3xl text-brand-white tracking-wide">
              VARIETY PACK — ALL 4 FLAVORS
            </h4>
            <p className="font-body text-brand-muted text-sm mt-1">
              Try every flavor and save 15%.
            </p>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-right">
              <div className="font-body text-brand-muted text-xs line-through">PKR1396</div>
              <div className="font-heading text-3xl text-brand-white">PKR1199</div>
            </div>
            <button
              className="px-8 py-4 font-body font-semibold text-xs text-white tracking-[0.2em] uppercase transition-all duration-200 hover:shadow-[0_0_30px_rgba(200,131,42,0.3)]"
              style={{ background: "linear-gradient(135deg, #C8832A, #E8522A)" }}
            >
              Get Bundle
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
