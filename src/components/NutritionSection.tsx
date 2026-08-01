"use client";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

const macros = [
  { name: "Protein", value: 20, max: 30, unit: "g", color: "#E8522A" },
  { name: "Total Carbs", value: 24, max: 40, unit: "g", color: "#C8832A" },
  { name: "Dietary Fiber", value: 5, max: 15, unit: "g", color: "#E4A854" },
  { name: "Total Fat", value: 8, max: 20, unit: "g", color: "#6B6B6B" },
];

const ingredients = [
  "Whey Protein Isolate",
  "Oat Flour",
  "Dark Chocolate Chips",
  "Whole Almonds",
  "Natural Caramel",
  "Himalayan Salt",
  "Sunflower Lecithin",
  "Vitamin E (Natural)",
];

const facts = [
  { label: "Total Fat", value: "8g", pct: "10%", indent: false },
  { label: "Saturated Fat", value: "2.5g", pct: "13%", indent: true },
  { label: "Trans Fat", value: "0g", pct: "", indent: true },
  { label: "Cholesterol", value: "30mg", pct: "10%", indent: false },
  { label: "Sodium", value: "180mg", pct: "8%", indent: false },
  { label: "Total Carbohydrate", value: "24g", pct: "9%", indent: false },
  { label: "Dietary Fiber", value: "5g", pct: "18%", indent: true },
  { label: "Total Sugars", value: "6g", pct: "", indent: true },
  { label: "Protein", value: "20g", pct: "40%", indent: false, highlight: true },
];

export default function NutritionSection() {
  return (
    <section id="nutrition" className="py-32 bg-brand-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* ── Left: Copy + Macro Bars ── */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-body text-[10px] font-semibold text-brand-caramel tracking-[0.4em] uppercase mb-4"
            >
              What's Inside
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-[clamp(3rem,7vw,5.5rem)] text-brand-white leading-none tracking-wider mb-8"
            >
              PACKED WITH<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-caramel to-brand-flame">
                WHAT MATTERS
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-body text-brand-muted leading-relaxed mb-10"
            >
              Every ingredient earns its place. We stripped away the fillers and loaded each bar
              with nutrients your body genuinely needs to perform at its peak.
            </motion.p>

            {/* Macro bars */}
            <div className="space-y-5 mb-12">
              {macros.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-body text-sm font-medium text-brand-white">{m.name}</span>
                    <span className="font-heading text-lg text-brand-white">{m.value}{m.unit}</span>
                  </div>
                  <div className="h-1.5 bg-brand-card rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(m.value / m.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.15 + i * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Key ingredients */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <p className="font-body text-[10px] font-semibold text-brand-muted tracking-[0.3em] uppercase mb-4">
                Key Ingredients
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {ingredients.map((ing) => (
                  <div key={ing} className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="text-brand-caramel flex-shrink-0" />
                    <span className="font-body text-brand-muted text-sm">{ing}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Nutrition Facts Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <div className="bg-brand-surface border border-brand-border p-8">
              {/* Header */}
              <div className="border-b-8 border-brand-white pb-1 mb-1">
                <h3 className="font-heading text-5xl text-brand-white tracking-wider">
                  Nutrition Facts
                </h3>
              </div>
              <div className="border-b-4 border-brand-white pb-2 mb-3">
                <p className="font-body text-brand-muted text-sm">1 serving per container</p>
                <div className="flex justify-between items-baseline">
                  <p className="font-body text-brand-muted text-sm">Serving size</p>
                  <p className="font-body text-brand-white text-sm font-bold">1 bar (62g)</p>
                </div>
              </div>

              {/* Calories */}
              <div className="flex justify-between items-end border-b-4 border-brand-white pb-2 mb-2">
                <div>
                  <p className="font-body text-brand-muted text-xs">Amount per serving</p>
                  <p className="font-body text-brand-muted text-sm font-bold">Calories</p>
                </div>
                <div className="font-heading text-6xl text-brand-white leading-none">220</div>
              </div>

              <div className="flex justify-end border-b border-brand-white pb-1 mb-2">
                <span className="font-body text-[11px] text-brand-muted font-bold">% Daily Value*</span>
              </div>

              {/* Facts rows */}
              <div className="space-y-1">
                {facts.map((f) => (
                  <div
                    key={f.label}
                    className={`flex items-center justify-between py-1 border-b border-brand-border/60 ${
                      f.indent ? "pl-4" : ""
                    } ${f.highlight ? "bg-brand-flame/10 px-3 -mx-3" : ""}`}
                  >
                    <span
                      className={`font-body text-sm ${
                        f.highlight
                          ? "text-brand-flame font-bold"
                          : f.indent
                          ? "text-brand-muted"
                          : "text-brand-white font-bold"
                      }`}
                    >
                      {f.label}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-body text-sm font-bold ${
                          f.highlight ? "text-brand-flame" : "text-brand-white"
                        }`}
                      >
                        {f.value}
                      </span>
                      {f.pct && (
                        <span className="font-body text-xs text-brand-muted">{f.pct}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-body text-[10px] text-brand-muted mt-4 leading-relaxed">
                * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your caloric needs.
              </p>
            </div>

            {/* Offset decorative border */}
            <div className="absolute -bottom-3 -right-3 w-full h-full border border-brand-caramel/20 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
