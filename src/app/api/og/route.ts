import { NextRequest, NextResponse } from "next/server";

const ELEMENT_COLORS: Record<string, { bg: string; accent: string; emoji: string }> = {
  fire:  { bg: "#2d0a14", accent: "#e94560", emoji: "🔥" },
  earth: { bg: "#0a2d14", accent: "#4ade80", emoji: "🌍" },
  air:   { bg: "#0a1a2d", accent: "#60a5fa", emoji: "💨" },
  water: { bg: "#100a2d", accent: "#a78bfa", emoji: "💧" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type     = searchParams.get("type") || "fire";
  const overview = (searchParams.get("overview") || "Discover the secrets written in your palm.").slice(0, 100);

  const meta    = ELEMENT_COLORS[type] ?? ELEMENT_COLORS.fire;
  const typeStr = type.charAt(0).toUpperCase() + type.slice(1);
  const label   = `${meta.emoji} ${typeStr} Palm Reading`;

  // Wrap overview text at ~55 chars
  const words   = overview.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 55) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  const textLines = lines.slice(0, 3);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${meta.bg}"/>
      <stop offset="100%" stop-color="#0f0f23"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${meta.accent}"/>
      <stop offset="100%" stop-color="${meta.accent}00"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative corner circles -->
  <circle cx="0" cy="0" r="300" fill="${meta.accent}" fill-opacity="0.05"/>
  <circle cx="1200" cy="630" r="300" fill="${meta.accent}" fill-opacity="0.05"/>

  <!-- Accent line -->
  <rect x="80" y="290" width="400" height="3" fill="url(#line)" rx="2"/>

  <!-- Brand -->
  <text x="80" y="120" font-family="serif" font-size="28" fill="${meta.accent}" opacity="0.8" letter-spacing="8">PALMWIS</text>

  <!-- Palm emoji large -->
  <text x="1050" y="200" font-size="140" text-anchor="middle">🖐️</text>

  <!-- Element label -->
  <text x="80" y="220" font-family="serif" font-size="52" fill="${meta.accent}" font-weight="bold">${label}</text>

  <!-- Overview lines -->
  ${textLines.map((l, i) => `<text x="80" y="${310 + i * 48}" font-family="sans-serif" font-size="30" fill="#c8c8d8">${l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")}</text>`).join("\n  ")}

  <!-- CTA -->
  <rect x="80" y="520" width="320" height="60" rx="30" fill="${meta.accent}"/>
  <text x="240" y="558" font-family="sans-serif" font-size="22" fill="white" text-anchor="middle" font-weight="bold">Read My Palm — Free</text>

  <!-- URL -->
  <text x="1120" y="610" font-family="sans-serif" font-size="20" fill="#888" text-anchor="end">palmwis.app</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
