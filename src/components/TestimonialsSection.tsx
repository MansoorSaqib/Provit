"use client";
import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "PROVIT has completely replaced my post-workout meal. The Caramel Crunch flavor is absolutely addictive and the macros are perfect for my training schedule. Nothing else comes close.",
    name: "Ali R.",
    role: "Competitive Athlete, Lahore",
    rating: 5,
    initials: "AR",
    colorA: "#E8522A",
    colorB: "#C8832A",
  },
  {
    quote:
      "I've tried every protein bar on the market. Nothing comes close to PROVIT in taste or clean ingredients. My entire gym is hooked. We order in bulk now.",
    name: "Ayesha K.",
    role: "CrossFit Athlete, Karachi",
    rating: 5,
    initials: "AK",
    colorA: "#C8832A",
    colorB: "#E4A854",
  },
  {
    quote:
      "I recommend PROVIT to every single client. The protein content is excellent, the ingredients are clean, and they actually taste incredible. Win-win-win in every way.",
    name: "Hassan T.",
    role: "Personal Trainer & Nutritionist, Islamabad",
    rating: 5,
    initials: "HT",
    colorA: "#6B4423",
    colorB: "#C8832A",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-32 bg-brand-black">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* Header */}
        <div className="mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-body text-[10px] font-semibold text-brand-caramel tracking-[0.4em] uppercase mb-4"
            >
              Social Proof
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-[clamp(3rem,8vw,6.5rem)] text-brand-white leading-none tracking-wider"
            >
              WHAT ATHLETES<br />
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #C8832A, #E8522A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                ARE SAYING
              </span>
            </motion.h2>
          </div>

          {/* Trust numbers — inline, no boxes */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex gap-10 lg:gap-12"
          >
            {[
              { value: "50k+", label: "Bars Sold" },
              { value: "4.8★", label: "Avg Rating" },
              { value: "98%", label: "Recommend" },
            ].map((b) => (
              <div key={b.label}>
                <div className="font-heading text-3xl text-brand-caramel tracking-wide">{b.value}</div>
                <div className="font-body text-brand-muted text-[10px] tracking-[0.2em] uppercase mt-1">{b.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Testimonials — editorial list, no cards */}
        <div>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="border-t border-brand-border group"
            >
              <div className="py-10 lg:py-14 flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">

                {/* Index number */}
                <span className="font-heading text-5xl text-brand-border group-hover:text-brand-caramel transition-colors duration-300 leading-none flex-shrink-0 hidden lg:block"
                  style={{ minWidth: "3.5rem" }}>
                  0{i + 1}
                </span>

                {/* Quote — large editorial type */}
                <div className="flex-1">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={13} className="text-brand-caramel fill-brand-caramel" />
                    ))}
                  </div>

                  <p className="font-body text-brand-white text-xl lg:text-2xl leading-relaxed font-light mb-8">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author — inline, no box */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${t.colorA}, ${t.colorB})`,
                      }}
                    >
                      <span className="font-body text-white text-[10px] font-bold">{t.initials}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-brand-white text-sm font-semibold">{t.name}</span>
                      <span className="w-px h-3 bg-brand-border" />
                      <span className="font-body text-brand-muted text-xs tracking-wide">{t.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-brand-border" />
        </div>
      </div>
    </section>
  );
}
