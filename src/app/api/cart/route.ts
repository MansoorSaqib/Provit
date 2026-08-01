import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.profile.findUnique({ where: { authId: user.id } });
}

export async function GET() {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ items: [], total: 0 }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { profileId: profile.id },
    include: { items: { include: { product: { select: { name: true, price: true, slug: true } } } } },
  });

  const items = cart?.items ?? [];
  const total = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, flavor, quantity = 1 } = await req.json();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { inventory: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const resolvedFlavor = flavor ?? product.inventory[0]?.flavor;
  if (!resolvedFlavor) return NextResponse.json({ error: "No flavor available" }, { status: 400 });

  const cart = await prisma.cart.upsert({
    where: { profileId: profile.id },
    create: { profileId: profile.id },
    update: {},
  });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId_flavor: { cartId: cart.id, productId: product.id, flavor: resolvedFlavor } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, flavor: resolvedFlavor, quantity },
    });
  }

  return NextResponse.json({ ok: true });
}
