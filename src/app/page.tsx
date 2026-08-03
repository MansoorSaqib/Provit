import type { Metadata } from "next";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import WhySection from "@/components/WhySection";
import BrandStatement from "@/components/BrandStatement";
import NutritionSection from "@/components/NutritionSection";
import CatalogSection from "@/components/CatalogSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.provit.site" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.provit.site/#organization",
      name: "PROVIT",
      url: "https://www.provit.site",
      logo: {
        "@type": "ImageObject",
        url: "https://www.provit.site/logo.png",
      },
      description:
        "PROVIT crafts premium protein bars with clean, real ingredients for athletes who refuse to settle.",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.provit.site/#website",
      url: "https://www.provit.site",
      name: "PROVIT",
      publisher: { "@id": "https://www.provit.site/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://www.provit.site/?s={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Product",
      name: "PROVIT Premium Protein Bar",
      description:
        "Premium protein bar with 11g protein, 172 calories, and zero artificial additives. Made with almonds, oats, peanuts, honey, and dates.",
      brand: { "@type": "Brand", name: "PROVIT" },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "PKR",
        lowPrice: "299",
        offerCount: "2",
        availability: "https://schema.org/InStock",
        url: "https://www.provit.site/#products",
      },
      nutrition: {
        "@type": "NutritionInformation",
        servingSize: "1 bar (40g)",
        calories: "172",
        proteinContent: "11.1g",
        carbohydrateContent: "16g",
        fatContent: "7.4g",
        fiberContent: "1.08g",
      },
    },
  ],
};

export default async function Home() {
  const raw = await prisma.product.findMany({
    where: { isActive: true },
    include: { inventory: { take: 1 } },
    orderBy: { createdAt: "asc" },
  });

  const products = raw.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price: Number(p.price),
    images: p.images,
    discountEnabled: p.discountEnabled,
    discountType: p.discountType,
    discountValue: p.discountValue ? Number(p.discountValue) : null,
    discountEndsAt: p.discountEndsAt ? p.discountEndsAt.toISOString() : null,
    stock: p.inventory[0]?.stock ?? 0,
  }));

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <MarqueeBanner />
      <WhySection />
      <BrandStatement />
      <NutritionSection />
      <CatalogSection products={products} />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
