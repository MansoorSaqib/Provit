const SocialIcons = [
  {
    label: "Instagram",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    svg: (
      <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47a2.78 2.78 0 0 0-1.95 1.95A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    svg: (
      <svg width="14" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.86a8.27 8.27 0 0 0 4.84 1.55V7a4.85 4.85 0 0 1-1.07-.31z" />
      </svg>
    ),
  },
];

const nav = {
  Products: ["Caramel Crunch", "Dark Choco Fudge", "Variety Pack"],
  Company: ["About Us", "Our Story", "Careers", "Press", "Partners"],
  Support: ["FAQ", "Shipping & Returns", "Track Order", "Contact Us", "Privacy Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-brand-black border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand col — wider */}
          <div className="lg:col-span-2">
            <div className="font-heading text-4xl text-brand-white tracking-widest mb-4">
              PRO<span className="text-brand-flame">VIT</span>
            </div>
            <p className="font-body text-brand-muted text-sm leading-relaxed mb-6 max-w-xs">
              Fuel your performance with premium protein bars. Clean ingredients,
              bold taste, unstoppable results.
            </p>
            {/* Social */}
            <div className="flex gap-3 mb-8">
              {SocialIcons.map((s) => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  className="w-9 h-9 border border-brand-border flex items-center justify-center text-brand-muted hover:border-brand-caramel hover:text-brand-caramel transition-all duration-200"
                >
                  {s.svg}
                </button>
              ))}
            </div>
            {/* Newsletter */}
            <div>
              <p className="font-body text-[10px] font-semibold text-brand-muted tracking-[0.25em] uppercase mb-3">
                Stay in the loop
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-brand-card border border-brand-border text-brand-white font-body text-xs px-4 py-3 focus:outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
                />
                <button className="px-5 bg-brand-flame hover:bg-brand-flame-dark text-white font-body text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-200 border border-brand-flame whitespace-nowrap">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(nav).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-heading text-sm text-brand-white tracking-[0.25em] uppercase mb-6">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-body text-brand-muted text-sm hover:text-brand-caramel transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-brand-muted text-xs">
            © {new Date().getFullYear()} PROVIT. All rights reserved. Built for athletes.
          </p>
          <div className="flex gap-6">
            {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-body text-brand-muted text-xs hover:text-brand-white transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
