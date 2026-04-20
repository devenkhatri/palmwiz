# PalmWis - AI Palm Reading App

An ancient palmistry reading web app powered by AI. Upload your palm photo and discover what the ancient art of chiromancy reveals about your personality, destiny, and potential.

## Features

- **Photo Upload**: Drag & drop or click to upload palm photos (JPEG, PNG, WebP)
- **AI-Powered Readings**: Uses OpenRouter AI to generate personalized palm readings
- **7-Tab Reading System**:
  - Overview - Your palm type and true nature
  - Major Lines - Life, Heart, Head, and Fate lines
  - Mounts - The seven mounts of the palm
  - Fingers - What your fingers reveal
  - Signs & Marks - Special markings
  - Career - Professional insights
  - Love - Relationship guidance

## Palm Types

- 🔥 **Fire** - Bold, passionate, natural-born leaders
- 🌍 **Earth** - Practical, reliable, grounded
- 💨 **Air** - Intellectual, analytical, curious
- 💧 **Water** - Intuitive, creative, emotional

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
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openrouter/free
```

Get your free API key at https://openrouter.ai/

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

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- OpenRouter AI (vision model)

## License

MIT

---

*For entertainment purposes only. Palm reading should not be used as the sole basis for major life decisions.*