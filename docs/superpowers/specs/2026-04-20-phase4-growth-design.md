# PHASE 4 — Growth Features Design

## Overview
Implement 4 growth features for PalmWis: OG image generation, SEO optimization, testimonials section, and AI-powered Tarot/Numerology pages.

---

## 1. OG Image Generation

### Goal
Generate dynamic OG images for social shares showing reading results.

### Approach
- Use `@vercel/og` (included with Next.js) for image generation
- Create `/api/og/[token]` route that generates OG image from reading data
- Image includes: palm type emoji, reading overview (truncated), branding

### Data Flow
```
Share URL → /reading/[token] → og:image meta tag → /api/og?type=fire&overview=...
```

### Implementation
- New route: `src/app/api/og/route.ts`
- Use `ImageResponse` from `@vercel/og`
- Return PNG image with reading metadata

---

## 2. SEO Features

### Goal
Improve search visibility and social sharing.

### Components

#### Sitemap (sitemap.xml)
- Auto-generated from all routes
- Routes: /, /compatibility, /tarot, /numerology, /reading/[token]
- Last modified: dynamic

#### Robots.txt
- Allow all crawlers
- Sitemap reference

#### JSON-LD Structured Data
- `Organization` schema on all pages
- `Service` schema on reading pages
- `Product` schema on pricing

#### Dynamic Metadata
- Page titles: "PalmWis - [Page Name]"
- Descriptions: Custom per page
- OG images: Dynamic from reading (for /reading/[token])

### Implementation
- `src/app/sitemap.ts` - Sitemap generator
- `src/app/robots.ts` - Robots.txt
- Update `src/app/layout.tsx` with metadata

---

## 3. Testimonials Section

### Goal
Build trust with social proof on homepage.

### UI Design
- Section between hero and upload
- 4 testimonial cards in responsive grid
- Mobile: 1 column, Desktop: 2x2

### Content
```typescript
const testimonials = [
  { name: "Sarah M.", avatar: "👩", quote: "Shocking accuracy!", rating: 5 },
  { name: "James K.", avatar: "👨", quote: "Career insight changed my life", rating: 5 },
  { name: "Priya S.", avatar: "👩‍💼", quote: "Love reading was so accurate", rating: 5 },
  { name: "Mike R.", avatar: "🧔", quote: "Freaked me out honestly", rating: 5 },
];
```

### Implementation
- New component: `src/components/Testimonials.tsx`
- Add to homepage between hero and upload sections

---

## 4. Tarot & Numerology Pages

### Goal
Expand reading offerings with AI-powered Tarot and Numerology.

### Tarot Page (/tarot)

#### Features
- Digital tarot card deck (78 cards)
- User selects 3-5 cards via click
- Cards flip with animation
- AI interprets via OpenRouter

#### API
- Reuse `/api/palm-read` with tarot prompt
- Prompt includes card names and positions (past/present/future)

#### Files
- `src/app/tarot/page.tsx` - Tarot reading page
- `src/app/api/tarot-read/route.ts` - Tarot API

### Numerology Page (/numerology)

#### Features
- Input: Name + Date of Birth
- Calculate: Life Path, Expression, Soul Urge numbers
- AI interprets via OpenRouter

#### API
- Reuse `/api/palm-read` with numerology prompt
- Calculate numbers from name (A1=1, B2=2...) and DOB

#### Files
- `src/app/numerology/page.tsx` - Numerology reading page
- `src/app/api/numerology-read/route.ts` - Numerology API

### Shared Components
- Reuse existing: Toast, EmailGateModal, PaywallModal
- New reusable: `TarotCard`, `NumerologyInput`

### Navigation
Add links to header:
```tsx
<nav className="flex gap-3">
  <Link href="/">Palm</Link>
  <Link href="/tarot">Tarot</Link>
  <Link href="/numerology">Numerology</Link>
</nav>
```

---

## Implementation Order

1. Testimonials section (simplest)
2. SEO features (technical foundation)
3. Tarot page + API
4. Numerology page + API
5. OG image generation (requires readings DB first)

---

## Dependencies

- Already installed: `@vercel/og` (via Next.js)
- No new packages needed

---

## Files to Create/Modify

### New Files
- `src/app/api/og/route.ts`
- `src/app/api/tarot-read/route.ts`
- `src/app/api/numerology-read/route.ts`
- `src/app/tarot/page.tsx`
- `src/app/numerology/page.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/components/Testimonials.tsx`
- `src/components/TarotCard.tsx`

### Modified Files
- `src/app/layout.tsx` - Add nav links + metadata
- `src/app/page.tsx` - Add testimonials section
- `src/app/compatibility/page.tsx` - Add nav link
- `src/app/reading/[token]/page.tsx` - OG image tag

---

## Acceptance Criteria

1. [ ] Sitemap.xml accessible and lists all routes
2. [ ] Robots.txt allows crawling
3. [ ] JSON-LD present in page source
4. [ ] Testimonials show on homepage (mobile responsive)
5. [ ] /tarot page allows card selection and shows reading
6. [ ] /numerology page accepts input and shows reading
7. [ ] OG images generate correctly for shared links
8. [ ] Header shows navigation to all pages
9. [ ] All pages work on mobile