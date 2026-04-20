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
  "overview": "2-3 paragraph overview of the reading",
  "cards": [
    {"name": "Card Name", "position": "Past/Present/Future", "meaning": "What this card means in this position", "upright": "Upright meaning", "reversed": "Reversed meaning if applicable"}
  ],
  "interpretation": "How the cards work together",
  "advice": "2-3 sentences of guidance",
  "career": "2-3 sentences about career based on cards",
  "love": "2-3 sentences about love based on cards"
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
      if (!cleaned.startsWith('{')) {
        const startIdx = cleaned.indexOf('{');
        if (startIdx >= 0) cleaned = cleaned.substring(startIdx);
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