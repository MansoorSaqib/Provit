import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authId: user.id } });
  if (!profile || profile.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const count = await prisma.order.count();
  return NextResponse.json({ count });
}
