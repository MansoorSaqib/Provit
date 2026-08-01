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

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <MarqueeBanner />
      <WhySection />
      <BrandStatement />
      <NutritionSection />
      <CatalogSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
