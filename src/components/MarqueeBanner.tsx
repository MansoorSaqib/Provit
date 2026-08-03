const items = [
  "Premium Protein",
  "11g Per Bar",
  "Clean Ingredients",
  "2 Bold Flavors",
  "172 Calories",
  "No Compromise",
  "Lab Tested",
];

export default function MarqueeBanner() {
  const doubled = [...items, ...items];

  return (
    <div className="bg-gradient-to-r from-brand-flame via-brand-flame-dark to-brand-flame py-3.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center font-heading text-white text-xl tracking-[0.25em] uppercase"
          >
            {item}
            <span className="mx-6 text-white/30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
