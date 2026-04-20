# PalmWis - AI Palm Reading App

An ancient palmistry reading web app powered by AI. Upload your palm photo and discover what the ancient art of chiromancy reveals about your personality, destiny, and potential.

## Features

### Core Features

- **Photo Upload**: Drag & drop or click to upload palm photos (JPEG, PNG, WebP)
- **Mobile Camera**: Take photos directly on mobile devices
- **AI-Powered Readings**: Uses OpenRouter AI to generate personalized palm readings
- **Local Fallback Algorithm**: Classic reading algorithm when AI is unavailable
- **Hand Detection**: Automatically verifies uploaded image is a hand/palm before analysis

### Credit System

| User Type | Free Credits |
|----------|--------------|
| Anonymous | 2 credits |
| Email registered | 3 credits |
| Coupon codes | Configurable via `.env` |

- **Click-to-reveal**: Click the credit badge to see remaining credits and purchase more
- **Coupon Support**: Redeem credits via coupon codes in `.env`
- **Smart Refund**: Non-hand images are rejected without consuming credits

### Reading System (7 Tabs)

| Tab | Description | Access |
|-----|-------------|--------|
| Overview | Your palm type and true nature | Free |
| Major Lines | Life, Heart, Head, and Fate lines | Email unlock |
| Mounts | The seven mounts of the palm | Email unlock |
| Fingers | What your fingers reveal | Email unlock |
| Signs & Marks | Special markings on your palm | Email unlock |
| Career | Professional insights | Email unlock |
| Love | Relationship guidance | Email unlock |

### Palm Types

- 🔥 **Fire** - Bold, passionate, natural-born leaders
- 🌍 **Earth** - Practical, reliable, grounded
- 💨 **Air** - Intellectual, analytical, curious
- 💧 **Water** - Intuitive, creative, emotional

### Additional Features

- **Compatibility Reading**: Compare two palms to see relationship compatibility
- **Shareable Links**: Share your reading via unique URL
- **PDF Export**: Save your reading as PDF
- **Payment Integration**: Razorpay for purchasing credits + coupon redemption

## Setup

### Prerequisites

- Node.js 18+
- Bun package manager

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: OpenRouter AI for palm readings
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=google/gemini-flash-1.5-8b

# Optional: Supabase for storing readings (for shareable links)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Razorpay for payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Optional: Coupon codes (format: COUPON_<CODE>=<credits>)
# Example: COUPON_TEST5=5
```

Get your free API key at https://openrouter.ai/

### Database Setup

If using Supabase for shareable reading links:

1. Create a Supabase project at https://supabase.com
2. Run the schema in `supabase-schema.sql` via Supabase SQL editor
3. Add the environment variables above

### Development

```bash
bun run dev
```

Open http://localhost:3000 to view the app.

### Build

```bash
bun run build
```

### Lint & TypeCheck

```bash
bun run lint
bun run typecheck
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- OpenRouter AI (vision model for palm analysis)
- Supabase (database for shareable readings)
- Razorpay (payment processing)

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main reading page
│   ├── compatibility/     # Compatibility reading page
│   ├── reading/[token]/   # Shared reading page
│   └── api/
│       ├── palm-read/    # AI palm reading API
│       ├── readings/save # Save reading to DB
│       └── razorpay/     # Payment APIs
├── components/
│   ├── EmailGateModal.tsx # Email unlock modal
│   └── PaywallModal.tsx  # Payment modal
└── lib/
    ├── credits.ts         # Credit system
    └── supabase.ts       # Supabase client
```

## License

MIT

---

*For entertainment purposes only. Palm reading should not be used as the sole basis for major life decisions.*