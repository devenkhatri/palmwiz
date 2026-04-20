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
  "type": "fire" | "earth" | "air" | "water",
  "overview": "A 2-3 paragraph overview of the person's palm type and personality",
  "majorLines": [
    {"title": "Life Line", "content": "Description of their Life Line", "meaning": "What this means for them"},
    {"title": "Heart Line", "content": "Description of their Heart Line", "meaning": "What this means for them"},
    {"title": "Head Line", "content": "Description of their Head Line", "meaning": "What this means for them"},
    {"title": "Fate Line", "content": "Description of their Fate Line", "meaning": "What this means for them"}
  ],
  "mounts": [
    {"name": "Mount name", "content": "Description", "meaning": "What this means"},
    {"name": "Mount name", "content": "Description", "meaning": "What this means"},
    {"name": "Mount name", "content": "Description", "meaning": "What this means"}
  ],
  "fingers": [
    {"name": "Finger name", "content": "Description", "meaning": "What this means"},
    {"name": "Finger name", "content": "Description", "meaning": "What this means"}
  ],
  "signs": [
    {"name": "Sign name", "content": "Description", "meaning": "What this means"}
  ],
  "career": "2-3 sentences about career and success based on their palm",
  "love": "2-3 sentences about love and relationships based on their palm"
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

    if (!apiKey || apiKey === "your-api-key-here") {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
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
      reading = JSON.parse(content);
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