import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, credits } =
    await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      email?: string;
      credits: number;
    };

  // Verify HMAC-SHA256 signature
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected  = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Update credits in Supabase (best-effort — client also updates localStorage)
  try {
    const admin = createAdminClient();
    if (admin && email) {
      const { data } = await admin
        .from("user_credits")
        .select("credits")
        .eq("email", email)
        .single();

      const currentCredits = (data as { credits: number } | null)?.credits ?? 0;
      await admin.from("user_credits").upsert({
        email,
        credits: currentCredits + credits,
        plan: credits >= 999 ? "monthly" : "credits",
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Supabase credit sync failed (non-fatal):", err);
  }

  return NextResponse.json({ success: true, credits });
}
