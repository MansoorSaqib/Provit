"use client";
import { motion } from "motion/react";

const words = ["NO", "SHORTCUTS.", "NO", "COMPROMISES.", "JUST", "PROVIT."];

export default function BrandStatement() {
  return (
    <section className="relative py-40 bg-brand-card overflow-hidden">
      {/* Large background number */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <span
          className="font-heading text-[30vw] leading-none text-brand-white/[0.02] select-none tracking-widest"
        >
          PROVIT
        </span>
      </div>

      {/* Horizontal rule accents */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-caramel/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-flame/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`font-heading text-[clamp(2.5rem,7vw,6.5rem)] leading-none tracking-wider ${
                word === "PROVIT." ? "text-brand-flame" : "text-brand-white"
              }`}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="font-body text-brand-muted mt-10 text-sm tracking-[0.3em] uppercase max-w-sm mx-auto"
        >
          Built for athletes who refuse to settle
        </motion.p>
      </div>
    </section>
  );
}
