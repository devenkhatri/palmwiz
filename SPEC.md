# Palm Reader App Specification

## 1. Project Overview

**Project Name**: PalmWis - Palmistry Reading App  
**Type**: Interactive Web Application  
**Core Functionality**: Accept palm photos and generate AI-powered palm readings using OpenRouter API, with local fallback when API is unavailable  
**Target Users**: General public curious about palmistry, ages 16+  
**Live URL**: https://palmwis.app

---

## 2. UI/UX Specification

### Layout Structure

**Page Flow**:
1. Hero/Landing Section with tagline and CTA
2. Upload Section - drag & drop photo upload area
3. Analysis Section - processing animation
4. Results Section - detailed palm reading display

**Responsive Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette**:
- Primary: `#1a1a2e` (Deep midnight blue)
- Secondary: `#16213e` (Dark navy)
- Accent: `#e94560` (Mystical rose)
- Accent Secondary: `#0f3460` (Ocean blue)
- Highlight: `#f5c518` (Golden amber)
- Text Primary: `#eaeaea` (Soft white)
- Text Secondary: `#a0a0a0` (Muted gray)
- Success: `#4ade80` (Green)
- Card Background: `#252545` (Purple-navy)

**Typography**:
- Headings: "Cinzel Decorative", serif - mystical, elegant
- Subheadings: "Cinzel", serif
- Body: "Raleway", sans-serif - clean, readable
- Heading Sizes: H1: 3.5rem, H2: 2.5rem, H3: 1.75rem
- Body Size: 1rem (16px)
- Line Height: 1.7

**Spacing System**:
- Base unit: 8px
- Section padding: 80px vertical, 24px horizontal
- Card padding: 32px
- Element gaps: 16px - 24px

**Visual Effects**:
- Cards: Subtle glow effect with box-shadow `0 0 40px rgba(233, 69, 96, 0.15)`
- Buttons: Gradient borders, hover scale 1.02
- Background: Animated floating particles/stars effect
- Section transitions: Fade-in on scroll
- Text: Subtle text-shadow for headings

### Components

1. **Header**
   - Logo with palm icon
   - Navigation (minimal - just logo)
   - Sticky on scroll

2. **Hero Section**
   - Large tagline: "Discover Your Destiny Written in Your Palm"
   - Subtext: "Ancient palmistry wisdom made simple"
   - CTA button to upload

3. **Upload Area**
   - Large dashed border drop zone
   - Icon: palm hand
   - Text: "Drop your palm photo here" + "or click to browse"
   - Accepts: jpg, png, webp
   - Preview thumbnail after upload
   - States: default, hover, processing, complete

4. **Processing Indicator**
   - Animated scanning effect (line moving across palm image)
   - Loading text: "Reading your palm lines..."
   - Progress percentage

5. **Results Display**
   - Palm image display (smaller)
   - Tabbed navigation for reading sections:
     - Overview (personality summary)
     - Major Lines (Life, Heart, Head lines)
     - Mounts (Palm mounts analysis)
     - Fingers ( finger analysis)
     - Signs & Marks (special markings)
     - Career & Love (predictions)
   - Each section collapsible/expandable cards
   - Save as PDF button

6. **Footer**
   - Disclaimer text
   - "For entertainment purposes"
   - Minimal links

---

## 3. Functionality Specification

### Core Features

**Photo Upload**:
- Drag and drop support
- Click to browse file
- Image preview after upload
- Supported formats: JPEG, PNG, WebP
- Max file size: 10MB

**Palm Analysis (AI-Powered)**:
- Uses OpenRouter API with vision-enabled model
- Model configured via environment variable: `OPENROUTER_MODEL=openrouter/free`
- API key stored securely in `.env.local`
- Falls back to local algorithm when API unavailable

**API Integration**:
- Endpoint: `/api/palm-read` (POST)
- Sends image to OpenRouter AI for analysis
- Returns structured JSON palm reading
- Falls back gracefully on error

**Results Generation**:
- Generate 7 main sections of reading
- Each section has detailed content
- Use simple, accessible language
- Include "what this means for you" takeaways

### User Interactions

1. User lands on page → sees hero with CTA
2. User clicks "Read My Palm" → scrolls to upload section
3. User uploads photo → preview shown
4. User clicks "Analyze" → processing animation plays (3-5 seconds)
5. Results appear → user can browse tabs
6. User can start over with new photo

### Data Handling

- Image sent to OpenRouter API for AI analysis
- Reading returned as structured JSON
- Local fallback uses seeded random based on image characteristics
- No persistent storage needed
- Images not stored on server

### Environment Variables

```
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openrouter/free
```

Get API key at: https://openrouter.ai/

### Edge Cases

- Invalid file type → error message with accepted formats
- File too large → error message with size limit
- Very small image → warning about quality
- Upload cancelled → reset to upload state

---

## 4. Palmistry Content Structure

### Sections to Cover

1. **Personality Overview**
   - General palm type (element: Fire, Earth, Air, Water)
   - Overall character traits
   - Energy level

2. **Major Lines Analysis**
   - Life Line: Health, vitality, major life changes
   - Heart Line: Emotional nature, love style
   - Head Line: Thinking style, intellectual tendency
   - Fate Line: Career success, life path

3. **Mounts Analysis** (7 mounts)
   - Mount of Venus (love, creativity)
   - Mount of Jupiter (ambition, leadership)
   - Mount of Saturn (wisdom, stability)
   - Mount of Mercury (communication, business)
   - Upper Mars (courage, aggression)
   - Lower Mars (defense, persistence)
   - Mount of Moon (imagination, intuition)

4. **Finger Analysis**
   - Index finger (Jupiter) - ambition
   - Middle finger (Saturn) - responsibility
   - Ring finger (Apollo) - creativity
   - Little finger (Mercury) - communication
   - Thumb (Willpower)

5. **Special Signs & Marks**
   - Stars, crosses, circles, triangles
   - Broken lines
   - Chain lines

6. **Career & Finance**
   - Natural talents
   - Best career paths
   - Money relationship

7. **Love & Relationships**
   - Love language
   - Ideal partner
   - Relationship pattern

---

## 5. Acceptance Criteria

### Visual Checkpoints

- [ ] Dark mystical theme applied throughout
- [ ] Cinzel font visible in headings
- [ ] Golden accent color on key elements
- [ ] Animated particles in background
- [ ] Glow effects on cards
- [ ] Smooth hover transitions on buttons

### Functional Checkpoints

- [ ] Photo upload works (drag/drop and click)
- [ ] Image preview displays after upload
- [ ] Processing animation plays
- [ ] All 7 reading sections generate content
- [ ] Content is in simple, accessible language
- [ ] Tabs navigate between sections
- [ ] Can start over with new photo
- [ ] Responsive on mobile
- [ ] AI API integration works when key configured
- [ ] Falls back to local algorithm on API error

### Content Checkpoints

- [ ] Each section has 3-5 paragraphs
- [ ] Palmistry terms explained simply
- [ ] "What this means for you" takeaways included
- [ ] Reading sounds interesting and engaging