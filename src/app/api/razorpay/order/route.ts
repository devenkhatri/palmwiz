import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Plans
const PLANS = {
  credits: { amount: 19900, credits: 10, description: "10 Reading Credits" },   // ₹199
  monthly: { amount: 49900, credits: 999, description: "Monthly Unlimited" },   // ₹499
} as const;

export async function POST(req: NextRequest) {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
  }

  const { planType, email } = await req.json() as { planType: keyof typeof PLANS; email?: string };
  const plan = PLANS[planType];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: plan.amount,
      currency: "INR",
      receipt: receiptId,
      notes: { email: email ?? "", plan: planType },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Razorpay order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const order = await response.json();
  return NextResponse.json({
    orderId:     order.id,
    amount:      plan.amount,
    currency:    "INR",
    description: plan.description,
    credits:     plan.credits,
    keyId,        // safe to expose — it's the public key
  });
}
