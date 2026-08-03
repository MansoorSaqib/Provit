"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const ProteinBarCanvas = dynamic(() => import("./ProteinBarCanvas"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-brand-black flex flex-col overflow-hidden">

      {/* ── Atmosphere blobs ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -right-32 top-0 w-[70vw] h-screen"
          style={{ background: "radial-gradient(ellipse 60% 80% at 100% 30%, rgba(232,82,42,0.09) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -left-20 bottom-0 w-[50vw] h-[60vh]"
          style={{ background: "radial-gradient(ellipse 70% 60% at 0% 100%, rgba(200,131,42,0.07) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-brand-caramel/8 to-transparent" />
      </div>

      {/* ── Top meta bar ── */}
      <div className="relative flex items-center px-8 lg:px-16 pt-32 gap-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center gap-2.5 flex-shrink-0"
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-brand-flame animate-pulse" />
          <span className="font-body text-[10px] tracking-[0.35em] uppercase text-brand-muted">
            Premium Protein Bar
          </span>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
          className="flex-1 h-px bg-brand-border"
        />

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="font-body text-[10px] tracking-[0.35em] uppercase text-brand-muted flex-shrink-0"
        >
          Est. 2024
        </motion.span>
      </div>

      {/* ── Split content: text left, 3-D bar right ── */}
      <div className="relative flex-1 flex flex-col lg:flex-row">

        {/* Left: typographic hero */}
        <div className="flex flex-col justify-center px-8 lg:px-16 pt-10 pb-6 lg:w-[54%]">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3 mb-8 lg:mb-10"
          >
            <span className="block w-8 h-px bg-brand-caramel" />
            <span className="font-body text-[11px] tracking-[0.32em] text-brand-caramel uppercase">
              Fuel. Perform. Repeat.
            </span>
          </motion.div>

          {/* FUEL — solid white */}
          <div className="mb-10 lg:mb-14">
            <div className="overflow-hidden leading-none">
              <motion.span
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="hero-word block font-heading tracking-tight text-brand-white"
              >
                FUEL
              </motion.span>
            </div>

            {/* YOUR — caramel outline */}
            <div className="overflow-hidden leading-none">
              <motion.span
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
                className="hero-word block font-heading tracking-tight"
                style={{
                  WebkitTextStroke: "2px rgba(200,131,42,0.55)",
                  color: "transparent",
                }}
              >
                YOUR
              </motion.span>
            </div>

            {/* FIRE — flame gradient */}
            <div className="overflow-hidden leading-none">
              <motion.span
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
                className="hero-word block font-heading tracking-tight"
                style={{
                  backgroundImage: "linear-gradient(135deg, #E4A854 0%, #E8522A 45%, #C03018 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                FIRE.
              </motion.span>
            </div>
          </div>

          {/* Body + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row sm:items-end gap-8"
          >
            <p className="font-body text-brand-muted text-base leading-relaxed max-w-xs">
              Premium protein bars built for athletes who refuse to settle.
              Clean ingredients. Relentless taste.
            </p>

            <div className="flex items-center gap-5 flex-shrink-0">
              <a
                href="#products"
                className="group inline-flex items-center gap-2.5 bg-brand-flame hover:bg-brand-flame-dark text-white font-body font-semibold text-xs tracking-[0.22em] uppercase px-7 py-4 transition-colors duration-200"
              >
                Shop Now
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href="#why"
                className="font-body text-xs text-brand-muted tracking-[0.22em] uppercase hover:text-brand-white transition-colors duration-200 whitespace-nowrap"
              >
                Our Story
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right: 3-D protein bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="relative h-[480px] lg:flex-1 overflow-hidden"
          style={{ position: "relative" }}
        >
          {/* Left-edge blend so the bar fades into the dark text column */}
          <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none hidden lg:block" />
          {/* Right-edge fade */}
          <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none" />

          <ProteinBarCanvas className="absolute inset-0" />
        </motion.div>

      </div>

      {/* ── Bottom stats bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="relative border-t border-brand-border"
      >
        <div className="flex">
          {[
            { value: "20g", label: "Protein Per Bar" },
            { value: "220", label: "Calories" },
            { value: "4", label: "Bold Flavors" },
            { value: "0%", label: "Artificial Additives" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 + i * 0.07 }}
              className={`flex-1 py-7 px-5 lg:px-10 ${i > 0 ? "border-l border-brand-border" : ""}`}
            >
              <div
                className="font-heading text-brand-white leading-none mb-1.5"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)" }}
              >
                {s.value}
              </div>
              <div className="font-body text-[10px] text-brand-muted tracking-[0.22em] uppercase">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
