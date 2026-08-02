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
