import { NextRequest, NextResponse } from "next/server";

interface TarotReading {
  overview: string;
  cards: { name: string; position: string; meaning: string; upright: string; reversed: string }[];
  interpretation: string;
  advice: string;
  career: string;
  love: string;
}

const systemPrompt = `You are an expert tarot reader with deep knowledge of the tarot cards and their meanings.
The user has selected 3 tarot cards. Interpret them in the context of their positions (Past, Present, Future).

Respond ONLY with valid JSON in this exact format (no additional text):
{
  "overview": "A detailed 2-3 paragraph overview of the reading, summarizing the central theme of the cards drawn.",
  "cards": [
    {"name": "Card Name", "position": "Past/Present/Future", "meaning": "A fully detailed 4-5 sentence meaning of the card in this specific timeline position.", "upright": "A detailed explanation of its upright energy", "reversed": "A detailed explanation of its reversed energy if applicable"}
  ],
  "interpretation": "A sweeping 2-3 paragraph synthesis on how the past, present, and future cards interact to form a meaningful narrative.",
  "advice": "A deeply thoughtful 1-2 paragraph section offering actionable spiritual guidance and practical advice.",
  "career": "A comprehensive 1-2 paragraph deep dive into career, finances, and material success based on the spread.",
  "love": "A comprehensive 1-2 paragraph deep dive into romantic and platonic relationships based on the spread."
}`;

const TAROT_DECK = [
  { name: "The Fool", upright: "New beginnings, innocence, spontaneity, freedom", reversed: "recklessness, foolhardy, risk" },
  { name: "The Magician", upright: "manifestation, power, skill", reversed: "manipulation, untapped potential" },
  { name: "The High Priestess", upright: "intuition, mystery, inner voice", reversed: " surface, misunderstanding" },
  { name: "The Empress", upright: "fertility, nature, abundance", reversed: "neglect, emptiness" },
  { name: "The Emperor", upright: "authority, structure, stability", reversed: "tyranny, rigidity" },
  { name: "The Hierophant", upright: "tradition, guidance, beliefs", reversed: "rebellion, nonconformity" },
  { name: "The Lovers", upright: "love, harmony, choices", reversed: "disharmony, imbalance" },
  { name: "The Chariot", upright: "victory, willpower, determination", reversed: "aggression, lack of direction" },
  { name: "Strength", upright: "courage, patience, compassion", reversed: "weakness, self-doubt" },
  { name: "The Hermit", upright: "introspection, solitude, wisdom", reversed: "isolation, loneliness" },
  { name: "Wheel of Fortune", upright: "change, cycles, destiny", reversed: "bad luck, resistance" },
  { name: "Justice", upright: "balance, cause and effect", reversed: "dishonesty, unfairness" },
  { name: "The Hanged Man", upright: "sacrifice, new perspective", reversed: "stalling, giving up" },
  { name: "Death", upright: "transformation, endings", reversed: "resistance, stagnation" },
  { name: "Temperance", upright: "balance, patience, moderation", reversed: "imbalance, excess" },
  { name: "The Devil", upright: "temptation, shadow self", reversed: "release, freedom" },
  { name: "The Tower", upright: "upheaval, revelation", reversed: "avoidance, denial" },
  { name: "The Star", upright: "hope, inspiration, guidance", reversed: "despair, lost hope" },
  { name: "The Moon", upright: "illusion, intuition, dreams", reversed: "deception, confusion" },
  { name: "The Sun", upright: "joy, success, vitality", reversed: "temporary sadness" },
  { name: "Judgment", upright: "rebirth, inner call", reversed: "self-doubt, refusal" },
  { name: "The World", upright: "completion, achievement", reversed: "incompletion, stagnation" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cards, fileName } = body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "Please select at least one card" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5-8b";

    if (!apiKey || apiKey === "your-api-key-here") {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://palmwis.app",
        "X-Title": "PalmWis - Tarot Reading",
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
            content: `Please interpret these tarot cards:\n${cards.map((c: string, i: number) => `${i === 0 ? "Past" : i === 1 ? "Present" : "Future"}: ${c}`).join("\n")}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      return NextResponse.json({ error: `OpenRouter API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    console.log("OpenRouter response:", JSON.stringify(data));
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in response:", data);
      return NextResponse.json({ error: "No content returned from AI", debug: JSON.stringify(data).slice(0, 500) }, { status: 500 });
    }

    let reading: TarotReading;
    try {
      let cleaned = content.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        cleaned = match[0];
      }
      reading = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json({ error: "Invalid AI response format", debug: content.slice(0, 500) }, { status: 500 });
    }

    return NextResponse.json({ reading });

  } catch (error) {
    console.error("Tarot reading error:", error);
    return NextResponse.json({ error: "Failed to generate tarot reading" }, { status: 500 });
  }
}