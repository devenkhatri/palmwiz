import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const upperCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const key = `COUPON_${upperCode}`;
    const value = process.env[key];

    if (value) {
      const credits = parseInt(value, 10);
      if (!isNaN(credits) && credits > 0) {
        return NextResponse.json({ valid: true, credits });
      }
    }

    return NextResponse.json({ valid: false, credits: 0 });
  } catch {
    return NextResponse.json({ error: "Failed to validate" }, { status: 500 });
  }
}