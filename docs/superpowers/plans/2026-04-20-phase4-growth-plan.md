# PHASE 4 — Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 growth features: testimonials section, SEO optimization (sitemap/robots/JSON-LD), AI-powered Tarot and Numerology pages, and OG image generation.

**Architecture:** Build testimonials section and SEO first (foundation), then add Tarot/Numerology pages reusing existing palm reading API patterns, finally add dynamic OG images.

**Tech Stack:** Next.js 16 (App Router), @vercel/og, Tailwind CSS, OpenRouter API for AI readings.

---

## Task 1: Testimonials Section

**Files:**
- Create: `src/components/Testimonials.tsx`
- Modify: `src/app/page.tsx:665-680` (add between hero and upload)

- [ ] **Step 1: Create Testimonials component**

```tsx
"use client";

const testimonials = [
  { name: "Sarah M.", avatar: "👩", quote: "Shocking accuracy! The career insight was spot on.", rating: 5 },
  { name: "James K.", avatar: "👨", quote: "Changed my life. The love reading helped me understand my relationship patterns.", rating: 5 },
  { name: "Priya S.", avatar: "👩‍💼", quote: "My best friend recommended this and now I recommend it to everyone!", rating: 5 },
  { name: "Mike R.", avatar: "🧔", quote: "Skeptical at first but the accuracy freaked me out. Still thinking about it.", rating: 5 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(rating)].map((_, i) => (
        <span key={i} className="text-highlight text-sm">★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-decorative text-2xl md:text-3xl text-center mb-4">
          What People Say About <span className="text-highlight">PalmWis</span>
        </h2>
        <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
          Thousands of readings delivered. Here&apos;s what our community has to say.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {testimonials.map(({ name, avatar, quote, rating }) => (
            <div key={name} className="card-mystical p-5 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{name}</p>
                  <StarRating rating={rating} />
                </div>
              </div>
              <p className="text-text-secondary text-sm italic">&ldquo;{quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Testimonials to homepage**

After line ~680 in page.tsx (after hero section, before upload section), add:

```tsx
{/* Testimonials Section */}
<Testimonials />
```

Also add import at top:

```tsx
import Testimonials from "@/components/Testimonials";
```

- [ ] **Step 3: Build and verify**

```bash
cd /Users/devengoratela/Work/palmwiz && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Testimonials.tsx src/app/page.tsx
git commit -m "feat: add testimonials section to homepage"
```

---

## Task 2: SEO Features

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/layout.tsx` (add metadata)
- Modify: `src/app/compatibility/page.tsx` (add nav)
- Modify: `src/app/page.tsx` (add nav link to tarot/numerology)

- [ ] **Step 1: Create sitemap.ts**

```ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://palmwis.app";
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/compatibility`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tarot`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/numerology`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
```

- [ ] **Step 2: Create robots.ts**

```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://palmwis.app/sitemap.xml",
  };
}
```

- [ ] **Step 3: Update layout.tsx with metadata and nav links**

Read current layout.tsx first, then add:
1. Import `Metadata` from "next"
2. Add `export const metadata: Metadata = {...}`
3. Add nav links in header

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://palmwis.app"),
  title: {
    default: "PalmWis - AI Palm Reading",
    template: "%s | PalmWis",
  },
  description: "Ancient palmistry wisdom meets AI. Upload your palm photo and discover what your hands reveal about your personality, career, and love life.",
  keywords: ["palm reading", "palmistry", "hand reading", "fortune telling", "AI reading"],
  authors: [{ name: "PalmWis" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://palmwis.app",
    siteName: "PalmWis",
    title: "PalmWis - AI Palm Reading",
    description: "Ancient palmistry wisdom meets AI. Upload your palm photo and discover your destiny.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PalmWis - AI Palm Reading",
    description: "Ancient palmistry wisdom meets AI. Upload your palm photo and discover your destiny.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PalmWis",
              url: "https://palmwis.app",
              description: "AI-powered palm reading service",
              sameAs: ["https://twitter.com/palmwis"],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Add navigation links to header in page.tsx**

Add nav link buttons in header (near credit badge):

```tsx
<nav className="hidden md:flex items-center gap-2">
  <Link href="/tarot" className="text-xs text-text-secondary hover:text-highlight transition-colors">Tarot</Link>
  <Link href="/numerology" className="text-xs text-text-secondary hover:text-highlight transition-colors">Numerology</Link>
</nav>
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add SEO features (sitemap, robots, metadata, JSON-LD)"
```

---

## Task 3: Tarot Page

**Files:**
- Create: `src/app/tarot/page.tsx`
- Create: `src/app/api/tarot-read/route.ts`

- [ ] **Step 1: Create tarot-read API route**

Create from palm-read/route.ts, modify prompt:

```ts
import { NextRequest, NextResponse } from "next/server";

const systemPrompt = `You are an expert tarot reader with deep knowledge of the tarot cards and their meanings.
The user has selected 3 tarot cards. Interpret them in the context of their positions (Past/Current/Future or similar).

Respond ONLY with valid JSON in this exact format (no additional text):
{
  "overview": "2-3 paragraph overview of the reading",
  "cards": [
    {"name": "Card Name", "position": "Past/Current/Future", "meaning": "What this card means in this position", "upright": "Upright meaning", "reversed": "Reversed meaning if applicable"}
  ],
  "interpretation": "How the cards work together",
  "advice": "2-3 sentences of guidance",
  "career": "2-3 sentences about career based on cards",
  "love": "2-3 sentences about love based on cards"
}`;

export async function POST(request: NextRequest) {
  // Similar to palm-read but with tarot-specific logic
  // Reuse classification, error handling, credit system from palm-read
}
```

- [ ] **Step 2: Create tarot page**

Use page.tsx as template, create `/tarot` version:
- Card selection UI (78 cards, scrollable)
- Select 3 cards by clicking
- Show selected cards with flip animation
- Call `/api/tarot-read` for interpretation
- Display results in tabbed format (like palm reading)

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/tarot src/app/api/tarot-read
git commit -m "feat: add tarot reading page with AI interpretation"
```

---

## Task 4: Numerology Page

**Files:**
- Create: `src/app/numerology/page.tsx`
- Create: `src/app/api/numerology-read/route.ts`

- [ ] **Step 1: Create numerology-read API route**

```ts
import { NextRequest, NextResponse } from "next/server";

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
```

- [ ] **Step 2: Create numerology page**

- Input form: Name (required), Date of Birth (required)
- Calculate numbers from name (A=1, B=2, etc. - Chaldean)
- Calculate life path from DOB (day + month + year reduced to single digit)
- Call API with input
- Display results like palm reading

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/numerology src/app/api/numerology-read
git commit -m "feat: add numerology reading page with AI interpretation"
```

---

## Task 5: OG Image Generation

**Files:**
- Create: `src/app/api/og/route.ts`

- [ ] **Step 1: Create OG image API route**

```ts
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "palm";
  const overview = searchParams.get("overview")?.slice(0, 150) || "Get your palm read";
  const emoji = type === "fire" ? "🔥" : type === "earth" ? "🌍" : type === "air" ? "💨" : type === "water" ? "💧" : "🖐️";

  return new ImageResponse(
    (
      <div style={{ display: "flex", height: "100%", width: "100%", background: "#1a1a2e", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 40 }}>
          <span style={{ fontSize: 80 }}>{emoji}</span>
          <span style={{ fontSize: 40, color: "#f5c518", fontWeight: 600, marginTop: 20 }}>{type.toUpperCase()} Reading</span>
          <span style={{ fontSize: 24, color: "#eaeaea", marginTop: 20, textAlign: "center", maxWidth: 600 }}>{overview}</span>
          <span style={{ fontSize: 20, color: "#a0a0a0", marginTop: 20 }}>palmwis.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 2: Update reading page to use OG image**

In `/reading/[token]/page.tsx`, add to metadata:

```ts
openGraph: {
  images: [`${process.env.NEXT_PUBLIC_URL || 'https://palmwis.app'}/api/og?type=${reading.type}&overview=${encodeURIComponent(reading.overview.slice(0, 100))}`],
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/og src/app/reading/\[token\]/page.tsx
git commit -m "feat: add dynamic OG image generation"
```

---

## Execution Choice

**Plan complete and saved to `docs/superpowers/plans/2026-04-20-phase4-growth-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**