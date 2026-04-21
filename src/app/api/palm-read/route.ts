import { NextRequest, NextResponse } from "next/server";

interface PalmReading {
  type: string;
  overview: string;
  majorLines: { title: string; content: string; meaning: string }[];
  mounts: { name: string; content: string; meaning: string }[];
  fingers: { name: string; content: string; meaning: string }[];
  signs: { name: string; content: string; meaning: string }[];
  career: string;
  love: string;
}

const systemPrompt = `You are an expert palm reader with deep knowledge of chiromancy (palmistry). 
Analyze the palm image and provide a detailed reading.
Respond ONLY with valid JSON in this exact format (no additional text):
{
  "type": "fire",
  "overview": "A detailed 2-3 paragraph overview of the person's palm type, hand shape, and core personality traits.",
  "majorLines": [
    {"title": "Life Line", "content": "Detailed physical description of the line in the image", "meaning": "A rich 3-4 sentence explanation of what this signifies for their vitality, life changes, and overall path"},
    {"title": "Heart Line", "content": "Detailed physical description of the line in the image", "meaning": "A rich 3-4 sentence explanation of their emotional nature, romantic approach, and relationships"},
    {"title": "Head Line", "content": "Detailed physical description of the line in the image", "meaning": "A rich 3-4 sentence explanation of their intellectual capacity, thought process, and beliefs"},
    {"title": "Fate Line", "content": "Detailed physical description of the line in the image", "meaning": "A rich 3-4 sentence explanation of their career trajectory, luck, and life purpose"}
  ],
  "mounts": [
    {"name": "Mount name", "content": "Detailed physical description", "meaning": "A highly detailed interpretation of what this prominent mount reveals about their inner drivers"}
  ],
  "fingers": [
    {"name": "Finger name", "content": "Detailed physical description", "meaning": "A highly detailed interpretation of what this finger structure reveals about their expression"}
  ],
  "signs": [
    {"name": "Sign name", "content": "Detailed physical description", "meaning": "A highly detailed interpretation of what this mark signifies for their destiny"}
  ],
  "career": "A highly detailed 1-2 paragraph analysis of suitable career paths, their approach to work, business acumen, and professional milestones.",
  "love": "A highly detailed 1-2 paragraph deep dive into their love life, emotional needs, compatibility, and relationship patterns."
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, fileName } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5-8b";

    if (!apiKey || apiKey === "your-api-key-here") {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Step 1: Classify if image is a hand photo
    const classifyRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://palmwis.app",
        "X-Title": "PalmWis - Hand Classification",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an image classifier. Look at the image and determine if it shows a human hand/palm. Respond ONLY with exactly \"HAND\" if it shows a hand or palm, or \"NOT_HAND\" if it does not show a hand."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Is this a photo of a human hand or palm?" },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 10,
      }),
    });

    if (!classifyRes.ok) {
      // If classification fails, allow through (fail open)
      console.warn("Classification API failed, allowing through");
    } else {
      const classifyData = await classifyRes.json();
      const classification = classifyData.choices?.[0]?.message?.content?.trim().toUpperCase();
      
      if (classification !== "HAND") {
        return NextResponse.json(
          { error: "Please upload a photo of your hand/palm. This image does not appear to be a hand." },
          { status: 411 }
        );
      }
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://palmwis.app",
        "X-Title": "PalmWis - AI Palm Reading",
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
            content: [
              {
                type: "text",
                text: "Please analyze this palm photo and provide a detailed palmistry reading in the exact JSON format specified in the system prompt."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content returned from AI" },
        { status: 500 }
      );
    }

    let reading: PalmReading;
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
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reading });

  } catch (error) {
    console.error("Palm reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate palm reading" },
      { status: 500 }
    );
  }
}