import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ role: null });
  const profile = await prisma.profile.findUnique({ where: { authId: user.id }, select: { role: true, email: true } });
  return NextResponse.json(profile ?? { role: null });
}
