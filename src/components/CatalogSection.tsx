"use client";
import { motion } from "motion/react";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Caramel Crunch",
    tagline: "Our Signature",
    price: "3.49",
    protein: 20,
    calories: 220,
    rating: 4.9,
    reviews: 842,
    from: "#8B5B1A",
    to: "#C8832A",
    mid: "#E4A854",
    badge: "Best Seller",
    badgeColor: "#E8522A",
  },
  {
    id: 2,
    name: "Dark Choco Fudge",
    tagline: "For Chocolate Lovers",
    price: "3.49",
    protein: 21,
    calories: 215,
    rating: 4.8,
    reviews: 631,
    from: "#0D0500",
    to: "#3A1500",
    mid: "#6B3010",
    badge: "Fan Favorite",
    badgeColor: "#C8832A",
  },
  {
    id: 3,
    name: "Strawberry Blaze",
    tagline: "Fruity & Fierce",
    price: "3.49",
    protein: 19,
    calories: 210,
    rating: 4.7,
    reviews: 428,
    from: "#8B1A0D",
    to: "#CC3B1E",
    mid: "#E8522A",
    badge: "New",
    badgeColor: "#22c55e",
  },
  {
    id: 4,
    name: "Peanut Butter Pro",
    tagline: "Classic. Bold. Powerful.",
    price: "3.49",
    protein: 22,
    calories: 230,
    rating: 4.8,
    reviews: 519,
    from: "#3B2010",
    to: "#7A4F28",
    mid: "#9B6B3A",
    badge: "High Protein",
    badgeColor: "#E8522A",
  },
];

function ProductCard({ p, i }: { p: typeof products[0]; i: number }) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      className="relative overflow-hidden group cursor-pointer"
      style={{
        background: `linear-gradient(170deg, ${p.from} 0%, ${p.to} 60%, ${p.mid} 100%)`,
        height: "clamp(420px, 55vh, 580px)",
      }}
    >
      {/* Badge */}
      <div
        className="absolute top-5 left-5 z-20 px-3 py-1 font-body text-[9px] font-bold text-white tracking-[0.2em] uppercase"
        style={{ background: p.badgeColor }}
      >
        {p.badge}
      </div>

      {/* Giant watermark flavor name */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="font-heading select-none text-white leading-none tracking-widest"
          style={{
            fontSize: "clamp(5rem, 14vw, 12rem)",
            opacity: 0.06,
            whiteSpace: "nowrap",
          }}
        >
          {p.name.split(" ")[0].toUpperCase()}
        </span>
      </div>

      {/* Center product mockup */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="transform group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-500 ease-out"
        >
          {/* Bar shape */}
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
            {/* shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          </div>

          {/* Protein pill below bar */}
          <div className="mt-3 mx-auto w-fit px-3 py-1 bg-black/25 backdrop-blur-sm rounded-full flex items-center gap-1.5">
            <span className="font-heading text-white text-sm">{p.protein}g</span>
            <span className="font-body text-white/50 text-[9px] uppercase tracking-widest">Protein</span>
          </div>
        </div>
      </div>

      {/* Bottom info — always visible, more on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-6 transition-all duration-400"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
        }}
      >
        {/* Stars + reviews */}
        <div className="flex items-center gap-1.5 mb-3">
          {[...Array(5)].map((_, j) => (
            <Star
              key={j}
              size={11}
              className={j < Math.floor(p.rating) ? "text-brand-caramel fill-brand-caramel" : "text-white/20"}
            />
          ))}
          <span className="font-body text-white/40 text-[10px] ml-1">({p.reviews})</span>
        </div>

        <p className="font-body text-white/50 text-[10px] tracking-[0.2em] uppercase mb-1">{p.tagline}</p>
        <h3 className="font-heading text-2xl text-white tracking-wide mb-4 leading-tight">{p.name}</h3>

        {/* Price + CTA */}
        <div className="flex items-center gap-3">
          <span className="font-heading text-3xl text-white">${p.price}</span>
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-2 py-3 font-body font-semibold text-[10px] tracking-[0.2em] uppercase transition-all duration-200"
            style={{
              background: added ? "rgba(34,197,94,0.9)" : "rgba(232,82,42,0.9)",
              backdropFilter: "blur(8px)",
              color: "white",
            }}
          >
            <ShoppingCart size={13} />
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CatalogSection() {
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

        {/* Product grid — color IS the card, no box borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {products.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>

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
              <div className="font-body text-brand-muted text-xs line-through">$13.96</div>
              <div className="font-heading text-3xl text-brand-white">$11.99</div>
            </div>
            <button className="px-8 py-4 font-body font-semibold text-xs text-white tracking-[0.2em] uppercase transition-all duration-200 hover:shadow-[0_0_30px_rgba(200,131,42,0.3)]"
              style={{ background: "linear-gradient(135deg, #C8832A, #E8522A)" }}>
              Get Bundle
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
