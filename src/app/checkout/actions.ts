"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function placeOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const profile = await prisma.profile.upsert({
    where: { authId: user.id },
    create: {
      authId: user.id,
      email: user.email!,
      name: (user.user_metadata?.name as string | undefined) ?? null,
    },
    update: {},
  });

  const cart = await prisma.cart.findUnique({
    where: { profileId: profile.id },
    include: {
      items: {
        include: { product: { select: { id: true, price: true } } },
      },
    },
  });

  if (!cart || cart.items.length === 0) redirect("/#products");

  const email      = (formData.get("email")      as string).trim();
  const phone      = (formData.get("phone")       as string).trim();
  const fullName   = (formData.get("fullName")    as string).trim();
  const line1      = (formData.get("line1")       as string).trim();
  const line2      = ((formData.get("line2") as string) ?? "").trim();
  const city       = (formData.get("city")        as string).trim();
  const state      = (formData.get("state")       as string).trim();
  const postalCode = (formData.get("postalCode")  as string).trim();
  const country    = ((formData.get("country") as string) ?? "PK").trim();

  const subtotal = cart!.items.reduce(
    (s, i) => s + Number(i.product.price) * i.quantity,
    0,
  );

  const order = await prisma.$transaction(async (tx) => {
    // Persist phone on the profile so it pre-fills next time
    if (phone && phone !== profile.phone) {
      await tx.profile.update({
        where: { id: profile.id },
        data: { phone },
      });
    }

    // Create shipping address (with phone for this order)
    const address = await tx.address.create({
      data: {
        profileId: profile.id,
        fullName,
        phone,
        line1,
        line2: line2 || null,
        city,
        state,
        postalCode,
        country,
      },
    });

    // Create order linked to the address
    const newOrder = await tx.order.create({
      data: {
        profileId: profile.id,
        addressId: address.id,
        subtotal,
        shippingCost: 0,
        total: subtotal,
        items: {
          create: cart!.items.map((i) => ({
            productId: i.productId,
            flavor: i.flavor,
            quantity: i.quantity,
            priceAtPurchase: i.product.price,
          })),
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart!.id } });

    return newOrder;
  });

  redirect(`/checkout/success?order=${order.orderNumber}`);
}
