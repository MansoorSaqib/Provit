import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.profile.findUnique({ where: { authId: user.id } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { itemId } = await params;
  const { quantity } = await req.json();
  if (quantity < 1) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { itemId } = await params;
  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
