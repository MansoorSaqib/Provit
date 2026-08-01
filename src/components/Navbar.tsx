"use client";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";

const links = [
  { label: "Products", href: "#products" },
  { label: "Nutrition", href: "#nutrition" },
  { label: "Why Provit", href: "#why" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-brand-black/95 backdrop-blur-md border-b border-brand-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-heading text-3xl tracking-widest text-brand-white">
          PRO<span className="text-brand-flame">VIT</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-brand-muted hover:text-brand-white transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-brand-white hover:text-brand-caramel transition-colors">
            <ShoppingCart size={20} strokeWidth={1.5} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-flame rounded-full text-[9px] flex items-center justify-center font-bold leading-none">
              0
            </span>
          </button>

          <a
            href="#products"
            className="hidden md:inline-flex items-center px-6 py-2.5 bg-brand-flame hover:bg-brand-flame-dark text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-200"
          >
            Shop Now
          </a>

          <button
            className="md:hidden text-brand-white p-1"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-64 border-t border-brand-border" : "max-h-0"
        } bg-brand-surface`}
      >
        <div className="px-6 py-5 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-muted hover:text-brand-white transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#products"
            className="mt-2 inline-flex items-center justify-center py-3 bg-brand-flame text-white text-xs font-semibold tracking-[0.2em] uppercase"
            onClick={() => setOpen(false)}
          >
            Shop Now
          </a>
        </div>
      </div>
    </nav>
  );
}
