import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, reading, palmType } = await req.json() as {
    email?: string;
    reading: object;
    palmType: string;
  };

  if (!reading) {
    return NextResponse.json({ error: "Reading data required" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    // Supabase not configured — return a fake local share token so the UI still works
    const localToken = `local_${Math.random().toString(36).slice(2, 14)}`;
    return NextResponse.json({ shareToken: localToken, configured: false });
  }

  const { data, error } = await admin
    .from("readings")
    .insert({
      email:       email ?? null,
      reading_data: reading,
      palm_type:   palmType,
    })
    .select("share_token")
    .single();

  if (error) {
    console.error("Failed to save reading:", error);
    return NextResponse.json({ error: "Failed to save reading" }, { status: 500 });
  }

  return NextResponse.json({
    shareToken: (data as { share_token: string }).share_token,
    configured: true,
  });
}
