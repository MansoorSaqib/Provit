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

async function uploadProductImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buf  = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("products")
    .upload(path, buf, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  return supabaseAdmin.storage.from("products").getPublicUrl(path).data.publicUrl;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name    = (formData.get("name")    as string).trim();
  const price   = parseFloat(formData.get("price") as string);
  const tagline = (formData.get("tagline") as string).trim();
  const stock   = parseInt(formData.get("stock") as string, 10);
  const file    = formData.get("image") as File;

  const imageUrl = await uploadProductImage(file);
  const slug     = toSlug(name);

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      price,
      tagline: tagline || null,
      images: imageUrl ? [imageUrl] : [],
      isActive: true,
      inventory: {
        create: { flavor: "Default", stock: isNaN(stock) ? 0 : stock },
      },
    },
  });

  revalidatePath("/admin/products");
  return product.id;
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();

  const name    = (formData.get("name")    as string).trim();
  const price   = parseFloat(formData.get("price") as string);
  const tagline = (formData.get("tagline") as string).trim();
  const stock   = parseInt(formData.get("stock") as string, 10);
  const file    = formData.get("image") as File;

  const imageUrl = await uploadProductImage(file);

  // Update product fields
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: { take: 1 } },
  });
  if (!product) throw new Error("Product not found");

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      price,
      tagline: tagline || null,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  });

  // Update or create stock entry
  if (product.inventory[0]) {
    await prisma.inventory.update({
      where: { id: product.inventory[0].id },
      data: { stock: isNaN(stock) ? 0 : stock },
    });
  } else {
    await prisma.inventory.create({
      data: { productId, flavor: "Default", stock: isNaN(stock) ? 0 : stock },
    });
  }

  revalidatePath("/admin/products");
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
