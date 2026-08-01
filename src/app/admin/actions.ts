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
  await supabaseAdmin.auth.admin.deleteUser(authId);
  await prisma.profile.delete({ where: { id: profileId } });
  revalidatePath("/admin/staff");
}
