"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const profile = await prisma.profile.findUnique({ where: { authId: user.id } });
  if (profile?.role !== "ADMIN") throw new Error("Forbidden");
  return profile;
}

async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const profile = await prisma.profile.findUnique({ where: { authId: user.id } });
  if (!profile || profile.role === "USER") throw new Error("Forbidden");
  return profile;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireStaff();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
}

export async function updateInventoryStock(inventoryId: string, stock: number) {
  await requireStaff();
  await prisma.inventory.update({ where: { id: inventoryId }, data: { stock } });
  revalidatePath("/admin/inventory");
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  await requireStaff();
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/admin/products");
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function parseProductFormData(formData: FormData) {
  const name            = (formData.get("name")     as string).trim();
  const price           = parseFloat(formData.get("salePrice") as string);
  const costPrice       = parseFloat(formData.get("costPrice") as string);
  const tagline         = (formData.get("tagline")  as string).trim();
  const stock           = parseInt(formData.get("stock") as string, 10);
  const imageUrl        = (formData.get("imageUrl") as string | null)?.trim() ?? "";
  const discountEnabled = formData.get("discountEnabled") === "true";
  const discountType    = (formData.get("discountType") as string | null) ?? "FIXED";
  const discountValue   = parseFloat(formData.get("discountValue") as string);
  const tillDateEnabled = formData.get("tillDateEnabled") === "true";
  const discountEndsAt  = tillDateEnabled
    ? new Date(formData.get("discountEndsAt") as string)
    : null;

  return {
    name,
    price: isNaN(price) ? 0 : price,
    costPrice: isNaN(costPrice) ? null : costPrice,
    tagline: tagline || null,
    stock: isNaN(stock) ? 0 : stock,
    imageUrl,
    discountEnabled,
    discountType: discountEnabled ? discountType : null,
    discountValue: discountEnabled && !isNaN(discountValue) ? discountValue : null,
    discountEndsAt: discountEnabled ? discountEndsAt : null,
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const d    = parseProductFormData(formData);
  const slug = toSlug(d.name);

  await prisma.product.create({
    data: {
      name: d.name,
      slug,
      price: d.price,
      costPrice: d.costPrice,
      tagline: d.tagline,
      images: d.imageUrl ? [d.imageUrl] : [],
      isActive: true,
      discountEnabled: d.discountEnabled,
      discountType: d.discountType,
      discountValue: d.discountValue,
      discountEndsAt: d.discountEndsAt,
      inventory: { create: { flavor: "Default", stock: d.stock } },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const d = parseProductFormData(formData);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: { take: 1 } },
  });
  if (!product) throw new Error("Product not found");

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: d.name,
      price: d.price,
      costPrice: d.costPrice,
      tagline: d.tagline,
      discountEnabled: d.discountEnabled,
      discountType: d.discountType,
      discountValue: d.discountValue,
      discountEndsAt: d.discountEndsAt,
      ...(d.imageUrl ? { images: [d.imageUrl] } : {}),
    },
  });

  if (product.inventory[0]) {
    await prisma.inventory.update({ where: { id: product.inventory[0].id }, data: { stock: d.stock } });
  } else {
    await prisma.inventory.create({ data: { productId, flavor: "Default", stock: d.stock } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function createStaffMember(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "STAFF";

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) throw new Error(error.message);

  await prisma.profile.create({
    data: { authId: data.user.id, email, name, role },
  });
  revalidatePath("/admin/staff");
}

export async function updateStaffRole(profileId: string, role: "ADMIN" | "STAFF") {
  await requireAdmin();
  await prisma.profile.update({ where: { id: profileId }, data: { role } });
  revalidatePath("/admin/staff");
}

export async function deleteStaffMember(profileId: string, authId: string) {
  await requireAdmin();
  const target = await prisma.profile.findUnique({ where: { id: profileId } });
  const superadminEmail = process.env.ADMIN_EMAIL ?? "mansoor@provit.site";
  if (target?.email === superadminEmail) throw new Error("The superadmin account cannot be removed.");
  await supabaseAdmin.auth.admin.deleteUser(authId);
  await prisma.profile.delete({ where: { id: profileId } });
  revalidatePath("/admin/staff");
}
