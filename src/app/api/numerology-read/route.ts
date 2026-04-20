import { NextRequest, NextResponse } from "next/server";

interface NumerologyReading {
  overview: string;
  lifePath: { number: number; meaning: string };
  expression: { number: number; meaning: string };
  soulUrge: { number: number; meaning: string };
  personalYear: { number: number; year: number; meaning: string };
  destiny: string;
  career: string;
  love: string;
  advice: string;
}

const CHALDEAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

function reduceToSingleDigit(n: number): number {
  if (n <= 9) return n;
  return reduceToSingleDigit(Math.floor(n / 10) + (n % 10));
}

function calculateChaldean(name: string): number {
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, "");
  let sum = 0;
  for (const char of cleaned) {
    sum += CHALDEAN_MAP[char] || 0;
  }
  return reduceToSingleDigit(sum);
}

function calculateLifePath(dob: string): number {
  const digits = dob.replace(/[^0-9]/g, "");
  let sum = 0;
  for (const digit of digits) {
    sum += parseInt(digit, 10);
  }
  return reduceToSingleDigit(sum);
}

function calculateExpression(name: string): number {
  return calculateChaldean(name);
}

function calculateSoulUrge(name: string): number {
  const vowels = name.toLowerCase().replace(/[^aeiou]/g, "");
  let sum = 0;
  for (const char of vowels) {
    sum += CHALDEAN_MAP[char] || 0;
  }
  return reduceToSingleDigit(sum);
}

function calculatePersonalYear(dob: string, year: number): number {
  const dobDigits = dob.replace(/[^0-9]/g, "");
  const month = parseInt(dobDigits.slice(0, 2), 10);
  const day = parseInt(dobDigits.slice(2, 4), 10);
  const sum = reduceToSingleDigit(month) + reduceToSingleDigit(day) + reduceToSingleDigit(year);
  return reduceToSingleDigit(sum);
}

const systemPrompt = `You are an expert numerology reader with deep knowledge of Chaldean and Pythagorean numerology.
Analyze the name and date of birth to determine Life Path, Expression, and Soul Urge numbers.

Respond ONLY with valid JSON in this exact format (no additional text):
{
  "overview": "2-3 paragraph overview of the numerology reading",
  "lifePath": {"number": 1-9, "meaning": "What this life path means"},
  "expression": {"number": 1-9, "meaning": "What this expression number means"},
  "soulUrge": {"number": 1-9, "meaning": "What this soul urge number means"},
  "personalYear": {"number": 1-9, "year": 2026, "meaning": "What this personal year means"},
  "destiny": "2-3 sentences about destiny",
  "career": "2-3 sentences about career",
  "love": "2-3 sentences about love",
  "advice": "2-3 sentences of guidance"
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dob } = body;

    if (!name || !dob) {
      return NextResponse.json({ error: "Name and date of birth are required" }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return NextResponse.json({ error: "Please enter date in YYYY-MM-DD format" }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const lifePath = calculateLifePath(dob);
    const expression = calculateExpression(name);
    const soulUrge = calculateSoulUrge(name);
    const personalYear = calculatePersonalYear(dob, year);

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openrouter/free";

    if (!apiKey || apiKey === "your-api-key-here") {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://palmwis.app",
        "X-Title": "PalmWis - Numerology Reading",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please interpret this numerology reading:\nName: ${name}\nDate of Birth: ${dob}\nLife Path Number: ${lifePath}\nExpression Number: ${expression}\nSoul Urge Number: ${soulUrge}\nPersonal Year ${year}: ${personalYear}`
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      return NextResponse.json({ error: `OpenRouter API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No content returned from AI" }, { status: 500 });
    }

    let reading: NumerologyReading;
    try {
      let cleaned = content.trim();
      if (!cleaned.startsWith('{')) {
        const startIdx = cleaned.indexOf('{');
        if (startIdx >= 0) cleaned = cleaned.substring(startIdx);
      }
      reading = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json({ error: "Invalid AI response format", debug: content.slice(0, 500) }, { status: 500 });
    }

    return NextResponse.json({ reading: { ...reading, calculations: { lifePath, expression, soulUrge, personalYear } } });

  } catch (error) {
    console.error("Numerology reading error:", error);
    return NextResponse.json({ error: "Failed to generate numerology reading" }, { status: 500 });
  }
}