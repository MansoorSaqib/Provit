"use client";
import { motion } from "motion/react";
import { Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    values: ["mansoorsaqib18@gmail.com", "shariqjajja@gmail.com"],
    links: ["mailto:mansoorsaqib18@gmail.com", "mailto:shariqjajja@gmail.com"],
  },
  {
    icon: Phone,
    label: "Phone",
    values: ["+92 344 0491155", "+92 301 6253902"],
    links: ["tel:+923440491155", "tel:+923016253902"],
  },
  {
    icon: MapPin,
    label: "Address",
    values: ["Satellite Town, Gujranwala", "Punjab, Pakistan"],
    links: [null, null],
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-32 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="max-w-2xl mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-body text-[10px] font-semibold text-brand-flame tracking-[0.4em] uppercase mb-4"
          >
            Get In Touch
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-[clamp(3rem,6vw,5.5rem)] text-brand-white leading-none tracking-wider mb-8"
          >
            LET&apos;S<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-caramel to-brand-flame">
              CONNECT
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-brand-muted leading-relaxed"
          >
            Questions about our products, wholesale inquiries, or partnership opportunities?
            Reach out directly — we&apos;d love to hear from you.
          </motion.p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="border border-brand-border bg-brand-card p-8 group hover:border-brand-caramel/50 transition-colors duration-300"
            >
              <div className="w-12 h-12 border border-brand-border group-hover:border-brand-caramel/50 flex items-center justify-center text-brand-caramel mb-6 transition-colors duration-300">
                <c.icon size={20} strokeWidth={1.5} />
              </div>
              <p className="font-body text-[10px] text-brand-muted tracking-[0.3em] uppercase mb-3">
                {c.label}
              </p>
              <div className="space-y-1.5">
                {c.values.map((val, j) =>
                  c.links[j] ? (
                    <a
                      key={j}
                      href={c.links[j]!}
                      className="block font-body text-brand-white text-sm hover:text-brand-caramel transition-colors duration-200"
                    >
                      {val}
                    </a>
                  ) : (
                    <p key={j} className="font-body text-brand-white text-sm">
                      {val}
                    </p>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 p-6 border border-brand-border bg-brand-card"
        >
          <p className="font-body text-[10px] font-semibold text-brand-caramel tracking-[0.3em] uppercase mb-2">
            Wholesale &amp; Bulk Orders
          </p>
          <p className="font-body text-brand-muted text-sm leading-relaxed">
            Interested in stocking PROVIT at your gym, store, or office? Reach out via email
            for pricing, minimum order quantities, and partnership details.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
