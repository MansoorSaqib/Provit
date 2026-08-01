import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mansoor@provit.site";
const ADMIN_PASS = "provit24";

async function createSupabaseUser(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = (await res.json()) as { id?: string; msg?: string; error?: string };
  if (!res.ok && !String(data.msg || data.error || "").includes("already")) {
    throw new Error(`Auth error: ${data.msg || data.error}`);
  }
  return data.id;
}

const products = [
  {
    name: "Caramel Crunch",
    slug: "caramel-crunch",
    tagline: "Our Signature Bar",
    description:
      "The bar that started it all. Rich caramel meets satisfying crunch, packed with 20g of premium whey protein.",
    price: 3.49,
    flavors: [{ flavor: "Original", stock: 100, sku: "CC-OG-001" }],
  },
  {
    name: "Dark Choco Fudge",
    slug: "dark-choco-fudge",
    tagline: "For Chocolate Lovers",
    description:
      "Deep, rich dark chocolate fudge with 21g of protein. The indulgence you deserve without the guilt.",
    price: 3.49,
    flavors: [{ flavor: "Dark Chocolate", stock: 85, sku: "DCF-DC-001" }],
  },
  {
    name: "Strawberry Blaze",
    slug: "strawberry-blaze",
    tagline: "Fruity & Fierce",
    description:
      "Bold strawberry flavor with a fiery finish. 19g of protein in a bar that tastes like a reward.",
    price: 3.49,
    flavors: [{ flavor: "Strawberry", stock: 60, sku: "SB-ST-001" }],
  },
  {
    name: "Peanut Butter Pro",
    slug: "peanut-butter-pro",
    tagline: "Classic. Bold. Powerful.",
    description:
      "Our highest-protein bar at 22g. Smooth peanut butter that hits hard and keeps you going.",
    price: 3.49,
    flavors: [{ flavor: "Peanut Butter", stock: 75, sku: "PBP-PB-001" }],
  },
];

async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Create admin in Supabase Auth
  console.log(`Creating admin user: ${ADMIN_EMAIL}`);
  const authId = await createSupabaseUser(ADMIN_EMAIL, ADMIN_PASS);

  if (authId) {
    await prisma.profile.upsert({
      where: { authId },
      create: { authId, email: ADMIN_EMAIL, name: "Mansoor (Admin)", role: "ADMIN" },
      update: { role: "ADMIN" },
    });
    console.log("✅ Admin profile created\n");
  } else {
    // User already exists — find by email and ensure ADMIN role
    const existing = await prisma.profile.findUnique({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      await prisma.profile.update({ where: { email: ADMIN_EMAIL }, data: { role: "ADMIN" } });
      console.log("✅ Existing admin profile updated to ADMIN role\n");
    } else {
      console.log("⚠️  Could not find/create admin profile — create manually\n");
    }
  }

  // 2. Seed products + inventory
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name, slug: p.slug, tagline: p.tagline,
        description: p.description, price: p.price,
        images: [], isActive: true,
      },
      update: { name: p.name, tagline: p.tagline, description: p.description, price: p.price },
    });

    for (const inv of p.flavors) {
      await prisma.inventory.upsert({
        where: { productId_flavor: { productId: product.id, flavor: inv.flavor } },
        create: { productId: product.id, flavor: inv.flavor, stock: inv.stock, sku: inv.sku, lowStockThreshold: 10 },
        update: { stock: inv.stock },
      });
    }
    console.log(`✅ ${p.name}`);
  }

  console.log("\n🎉 Seed complete!");
  console.log(`\nAdmin → ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
