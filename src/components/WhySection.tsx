"use client";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const reasons = [
  {
    number: "01",
    title: "Clean Ingredients",
    body: "No artificial colors, flavors, or preservatives. Every single ingredient earns its place and serves a purpose.",
    accent: "#4ade80",
  },
  {
    number: "02",
    title: "High Performance",
    body: "11g of natural protein per bar from real ingredients — almonds, peanuts, and oats — engineered to fuel muscle recovery and power every session.",
    accent: "#E8522A",
  },
  {
    number: "03",
    title: "Bold Taste",
    body: "We refused to compromise. Every flavor is obsessively crafted to satisfy intense cravings without the guilt.",
    accent: "#C8832A",
  },
  {
    number: "04",
    title: "Lab Certified",
    body: "Third-party tested for purity, potency, and accuracy on every single batch. No exceptions. No shortcuts.",
    accent: "#60a5fa",
  },
  {
    number: "05",
    title: "Science Backed",
    body: "Formulated alongside sports nutritionists. The macro ratio in each bar is optimized for real-world results.",
    accent: "#a78bfa",
  },
  {
    number: "06",
    title: "Always Ready",
    body: "No prep, no mess, no excuses. Grab a PROVIT bar and go — performance on your schedule.",
    accent: "#E4A854",
  },
];

export default function WhySection() {
  return (
    <section id="why" className="py-32 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-20 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-body text-[10px] font-semibold text-brand-flame tracking-[0.4em] uppercase mb-4"
            >
              The Provit Difference
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-[clamp(3rem,8vw,6.5rem)] text-brand-white leading-none tracking-wider"
            >
              WHY CHOOSE<br />
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #C8832A, #E8522A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                PROVIT?
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-brand-muted text-sm leading-relaxed max-w-xs lg:max-w-sm"
          >
            We built PROVIT because we were tired of choosing between tasting good
            and performing well. You shouldn&apos;t have to.
          </motion.p>
        </div>

        {/* Editorial list — NO boxes */}
        <div>
          {reasons.map((r, i) => (
            <motion.div
              key={r.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group border-t border-brand-border"
            >
              <div className="flex items-start gap-6 lg:gap-16 py-8 lg:py-10 transition-all duration-300">

                {/* Number */}
                <span
                  className="font-heading text-5xl lg:text-6xl leading-none flex-shrink-0 transition-colors duration-300 text-brand-border group-hover:text-brand-caramel"
                  style={{ minWidth: "3.5rem" }}
                >
                  {r.number}
                </span>

                {/* Title + body */}
                <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pt-1">
                  <h3
                    className="font-heading text-3xl lg:text-[2.75rem] text-brand-white tracking-wide leading-tight lg:max-w-xs transition-colors duration-300 group-hover:text-brand-caramel-light"
                  >
                    {r.title}
                  </h3>
                  <p className="font-body text-brand-muted text-sm leading-relaxed lg:max-w-md">
                    {r.body}
                  </p>
                </div>

                {/* Arrow — appears on hover */}
                <div className="flex-shrink-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight size={18} className="text-brand-caramel" />
                </div>
              </div>
            </motion.div>
          ))}
          {/* closing bottom border */}
          <div className="border-t border-brand-border" />
        </div>
      </div>
    </section>
  );
}
