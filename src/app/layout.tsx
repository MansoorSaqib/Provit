import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const BASE_URL = "https://www.provit.site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PROVIT | Premium Protein Bars — Fuel Your Fire",
    template: "%s | PROVIT",
  },
  description:
    "PROVIT premium protein bars deliver 11g protein, 172 calories, and zero artificial additives. 4 bold flavors crafted for athletes who refuse to settle. Clean ingredients. Relentless taste. Shop now.",
  keywords: [
    "protein bar",
    "premium protein bar",
    "protein bar Pakistan",
    "clean protein bar",
    "high protein snack",
    "athlete nutrition",
    "natural protein bar",
    "PROVIT",
    "protein bar no artificial additives",
    "protein bar almond oats peanut honey",
    "buy protein bar online",
    "fitness snack",
  ],
  authors: [{ name: "PROVIT", url: BASE_URL }],
  creator: "PROVIT",
  publisher: "PROVIT",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "PROVIT",
    title: "PROVIT | Premium Protein Bars — Fuel Your Fire",
    description:
      "11g protein. 172 calories. Zero artificial additives. 4 bold flavors for athletes who refuse to settle.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PROVIT Premium Protein Bars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PROVIT | Premium Protein Bars",
    description:
      "11g protein. 172 calories. Zero artificial additives. 4 bold flavors for athletes who refuse to settle.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  category: "food",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${montserrat.variable}`}>
      <body className="antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
