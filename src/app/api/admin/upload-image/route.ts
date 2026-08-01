import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Auth — admin or staff only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { authId: user.id } });
  if (!profile || profile.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buf  = await file.arrayBuffer();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/products/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: buf,
    },
  );

  if (!uploadRes.ok) {
    const detail = await uploadRes.text();
    return NextResponse.json({ error: `Upload failed: ${detail}` }, { status: 500 });
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/products/${path}`;
  return NextResponse.json({ url: publicUrl });
}
