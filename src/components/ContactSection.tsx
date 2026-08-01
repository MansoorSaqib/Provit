"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Send, Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@provit.co" },
  { icon: Phone, label: "Phone", value: "+1 (800) PRO-VITS" },
  { icon: MapPin, label: "Office", value: "San Francisco, CA 94102" },
];

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="py-32 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* ── Left ── */}
          <div>
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
              className="font-body text-brand-muted leading-relaxed mb-12"
            >
              Questions about our products? Partnership inquiries? Want to become a retail partner?
              We&apos;d love to hear from you.
            </motion.p>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {contactInfo.map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-11 h-11 border border-brand-border flex items-center justify-center text-brand-caramel flex-shrink-0">
                    <c.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-body text-[10px] text-brand-muted tracking-[0.25em] uppercase">{c.label}</div>
                    <div className="font-body text-brand-white text-sm mt-0.5">{c.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* FAQ teaser */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 border border-brand-border bg-brand-card"
            >
              <p className="font-body text-[10px] font-semibold text-brand-caramel tracking-[0.3em] uppercase mb-2">
                Quick Tip
              </p>
              <p className="font-body text-brand-muted text-sm leading-relaxed">
                Most order questions are answered in our{" "}
                <a href="#" className="text-brand-caramel hover:underline">FAQ section</a>.
                For bulk or wholesale inquiries, please mention it in your message.
              </p>
            </motion.div>
          </div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="font-body text-[10px] font-semibold text-brand-muted tracking-[0.25em] uppercase block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 focus:outline-none focus:border-brand-caramel transition-colors duration-200 placeholder:text-brand-muted/40"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-body text-[10px] font-semibold text-brand-muted tracking-[0.25em] uppercase block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 focus:outline-none focus:border-brand-caramel transition-colors duration-200 placeholder:text-brand-muted/40"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="font-body text-[10px] font-semibold text-brand-muted tracking-[0.25em] uppercase block mb-2">
                  Subject
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 focus:outline-none focus:border-brand-caramel transition-colors duration-200 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-brand-card">Select a topic...</option>
                  <option value="general" className="bg-brand-card">General Inquiry</option>
                  <option value="order" className="bg-brand-card">Order / Shipping</option>
                  <option value="wholesale" className="bg-brand-card">Wholesale / Retail</option>
                  <option value="partnership" className="bg-brand-card">Partnership</option>
                  <option value="other" className="bg-brand-card">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="font-body text-[10px] font-semibold text-brand-muted tracking-[0.25em] uppercase block mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3.5 focus:outline-none focus:border-brand-caramel transition-colors duration-200 placeholder:text-brand-muted/40 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-brand-flame to-brand-flame-dark text-white font-body text-xs font-semibold tracking-[0.25em] uppercase hover:shadow-[0_0_40px_rgba(232,82,42,0.3)] transition-all duration-300"
              >
                {sent ? "Message Sent!" : "Send Message"}
                {!sent && (
                  <Send size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                )}
              </button>

              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-body text-center text-sm text-green-400"
                >
                  Thanks! We&apos;ll get back to you within 24 hours.
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
