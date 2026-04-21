"use client";

import { useState, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────

type PalmType = "fire" | "earth" | "air" | "water";

interface PalmReading {
  type: PalmType;
  overview: string;
  majorLines: { title: string; content: string; meaning: string }[];
  career: string;
  love: string;
}

interface CompatibilityReport {
  score: number;
  summary: string;
  emotional: string;
  intellectual: string;
  career: string;
  challenges: string;
  advice: string;
}

const ELEMENT_TRAITS: Record<PalmType, string[]> = {
  fire:  ["Bold", "Passionate", "Leadership"],
  earth: ["Practical", "Reliable", "Grounded"],
  air:   ["Analytical", "Curious", "Communicative"],
  water: ["Intuitive", "Creative", "Empathetic"],
};

const COMPATIBILITY_MATRIX: Record<string, number> = {
  "fire-fire":    75,  "fire-earth":   65,  "fire-air":     90,  "fire-water":   60,
  "earth-earth":  85,  "earth-air":    70,  "earth-water":  80,
  "air-air":      80,  "air-water":    85,
  "water-water":  88,
};

function getBaseScore(a: PalmType, b: PalmType): number {
  const key = [a, b].sort().join("-");
  return COMPATIBILITY_MATRIX[key] ?? 70;
}

// ─── Upload Zone ──────────────────────────────────────────────

function UploadZone({
  label, image, onFile,
}: {
  label: string;
  image: string | null;
  onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = useCallback(
    (file: File) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
      if (file.size > 10 * 1024 * 1024) return;
      onFile(file);
    },
    [onFile]
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="font-decorative text-center text-text-secondary text-sm uppercase tracking-wider">{label}</p>
      {image ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={label}
            className="w-full max-h-56 object-cover rounded-xl"
            style={{ border: "2px solid rgba(233,69,96,0.4)" }}
          />
          <button
            onClick={() => { ref.current && (ref.current.value = ""); onFile(new File([], "")); }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-[#e94560] transition-colors"
          >✕</button>
        </div>
      ) : (
        <div
          className={`upload-zone py-10 ${drag ? "dragover" : ""}`}
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
        >
          <div className="text-4xl mb-3">🖐️</div>
          <p className="text-text-secondary text-sm">Drop photo or click to browse</p>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#4ade80" : score >= 65 ? "#f5c518" : "#e94560";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#252545" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x="65" y="60" textAnchor="middle" fill={color} fontSize="26" fontWeight="bold"
          fontFamily="Cinzel Decorative, serif">
          {score}
        </text>
        <text x="65" y="78" textAnchor="middle" fill="#a0a0a0" fontSize="10" fontFamily="Raleway, sans-serif">
          / 100
        </text>
      </svg>
      <p className="font-decorative text-highlight text-sm">Compatibility Score</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function CompatibilityPage() {
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [fileA, setFileA]   = useState<File | null>(null);
  const [fileB, setFileB]   = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [readingA, setReadingA]     = useState<PalmReading | null>(null);
  const [readingB, setReadingB]     = useState<PalmReading | null>(null);
  const [report, setReport]         = useState<CompatibilityReport | null>(null);
  const [error, setError]           = useState("");

  const handleFileA = (file: File) => {
    if (!file.name) { setImageA(null); setFileA(null); return; }
    setFileA(file);
    const r = new FileReader();
    r.onload = e => setImageA(e.target?.result as string);
    r.readAsDataURL(file);
  };
  const handleFileB = (file: File) => {
    if (!file.name) { setImageB(null); setFileB(null); return; }
    setFileB(file);
    const r = new FileReader();
    r.onload = e => setImageB(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageA || !imageB) return;
    setLoading(true);
    setError("");
    setProgress(10);

    // Analyze both palms in parallel
    const analyzeOne = async (image: string, label: string) => {
      try {
        const res = await fetch("/api/palm-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image, fileName: label }),
        });
        const d = await res.json();
        return d.reading as PalmReading;
      } catch {
        return null;
      }
    };

    try {
      setProgress(30);
      const [rA, rB] = await Promise.all([
        analyzeOne(imageA, fileA?.name ?? "palm-A.jpg"),
        analyzeOne(imageB, fileB?.name ?? "palm-B.jpg"),
      ]);
      setProgress(70);

      // Build compatibility report
      const a = rA ?? { type: "fire" as PalmType, overview: "", majorLines: [], career: "", love: "" };
      const b = rB ?? { type: "water" as PalmType, overview: "", majorLines: [], career: "", love: "" };

      const baseScore = getBaseScore(a.type, b.type);
      const jitter = Math.floor(Math.random() * 10) - 4;
      const score  = Math.min(100, Math.max(40, baseScore + jitter));

      const traitsA = ELEMENT_TRAITS[a.type];
      const traitsB = ELEMENT_TRAITS[b.type];

      const compat: CompatibilityReport = {
        score,
        summary: `A ${a.type.charAt(0).toUpperCase() + a.type.slice(1)} palm meets a ${b.type.charAt(0).toUpperCase() + b.type.slice(1)} palm — ${score >= 80 ? "a highly harmonious pairing" : score >= 65 ? "a complementary connection with great potential" : "a challenging but growth-oriented match"}.`,
        emotional: `The ${a.type} energy (${traitsA.join(", ")}) ${score >= 75 ? "flows naturally" : "creates healthy tension"} with the ${b.type} nature (${traitsB.join(", ")}). Emotional connection requires ${score >= 75 ? "little effort" : "intentional communication"}.`,
        intellectual: `Intellectually, ${a.type} and ${b.type} energies ${["fire","air"].includes(a.type) && ["fire","air"].includes(b.type) ? "spark constantly — expect lively debates and shared curiosity" : "balance each other — one grounds while the other imagines"}.`,
        career: `In shared ventures, the ${a.type} person brings ${traitsA[0].toLowerCase()} while the ${b.type} person contributes ${traitsB[0].toLowerCase()}. Together you cover strengths neither has alone.`,
        challenges: score >= 80
          ? "Your main challenge will be avoiding complacency — you're so compatible it's easy to stop growing."
          : score >= 65
          ? `The ${a.type}-${b.type} dynamic requires patience. Your natural tendencies can clash around decision-making and pace of life.`
          : `Significant differences in energy and approach may cause friction. Awareness of each other's palm type helps you navigate conflict consciously.`,
        advice: score >= 80
          ? "Celebrate how rarely this kind of natural harmony exists. Nurture it with your differences, not just your similarities."
          : score >= 65
          ? "Focus on what each of you uniquely brings. Your differences aren't bugs — they're features that make you stronger together."
          : "Choose each other consciously. This pairing grows through challenge — commit to understanding, not just compatibility.",
      };

      setReadingA(a);
      setReadingB(b);
      setReport(compat);
      setProgress(100);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageA(null); setImageB(null);
    setFileA(null);  setFileB(null);
    setReadingA(null); setReadingB(null);
    setReport(null); setProgress(0); setError("");
  };

  const scoreLabel = !report ? "" : report.score >= 80 ? "Highly Compatible ✨" : report.score >= 65 ? "Complementary Pair 🤝" : "Growth Match 💪";

  return (
    <main className="min-h-screen bg-mystical py-20 px-6">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1a2e] to-transparent py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-3xl">🖐️</span>
            <span className="font-decorative text-lg md:text-xl text-highlight">PalmWis</span>
          </a>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4">
              <a href="/" className="text-sm font-semibold text-text-secondary hover:text-highlight transition-colors">Palm</a>
              <a href="/compatibility" className="text-sm font-semibold text-highlight transition-colors">Compatibility</a>
              <a href="/tarot" className="text-sm font-semibold text-text-secondary hover:text-highlight transition-colors">Tarot</a>
              <a href="/numerology" className="text-sm font-semibold text-text-secondary hover:text-highlight transition-colors">Numerology</a>
            </nav>
            {report && (
              <button onClick={reset} className="btn-secondary text-xs py-1.5 px-3 md:text-sm md:py-2 md:px-5">New</button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        {!report && (
          <div className="text-center mb-12 fade-in">
            <h1 className="font-decorative text-3xl md:text-4xl text-highlight mb-4">
              Palm Compatibility Reading
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">
              Upload two palm photos and discover how compatible these two individuals are — across love, career, and emotional connection.
            </p>
          </div>
        )}

        {!report ? (
          <div className="card-mystical p-8 glow-subtle fade-in">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <UploadZone label="Person 1" image={imageA} onFile={handleFileA} />
              <UploadZone label="Person 2" image={imageB} onFile={handleFileB} />
            </div>

            {/* VS divider */}
            {imageA && imageB && (
              <div className="text-center mb-6">
                <span className="font-decorative text-2xl text-highlight">VS</span>
              </div>
            )}

            {loading && (
              <div className="mb-6">
                <div className="w-full bg-[#16213e] rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#e94560] to-[#f5c518] transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-text-secondary text-sm text-center">
                  {progress < 40 ? "Reading both palms..." : progress < 75 ? "Comparing energies..." : "Calculating compatibility..."}
                </p>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={analyze}
                disabled={!imageA || !imageB || loading}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing..." : "✨ Check Compatibility"}
              </button>
              <a href="/" className="btn-secondary text-center">← Single Reading</a>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6 fade-in">
            {/* Score */}
            <div className="card-mystical p-8 glow-gold text-center">
              <ScoreRing score={report.score} />
              <h2 className="font-decorative text-2xl text-highlight mt-4">{scoreLabel}</h2>
              <div className="flex justify-center gap-6 mt-4 text-sm text-text-secondary">
                <span>
                  {readingA?.type === "fire" ? "🔥" : readingA?.type === "earth" ? "🌍" : readingA?.type === "air" ? "💨" : "💧"}
                  &nbsp;<span className="capitalize">{readingA?.type}</span>
                </span>
                <span className="text-[#e94560]">+</span>
                <span>
                  {readingB?.type === "fire" ? "🔥" : readingB?.type === "earth" ? "🌍" : readingB?.type === "air" ? "💨" : "💧"}
                  &nbsp;<span className="capitalize">{readingB?.type}</span>
                </span>
              </div>
              <p className="text-text-secondary mt-4 max-w-lg mx-auto leading-relaxed">{report.summary}</p>
            </div>

            {/* Detail cards */}
            {[
              { icon: "❤️", title: "Emotional Compatibility", text: report.emotional },
              { icon: "🧠", title: "Intellectual Connection",  text: report.intellectual },
              { icon: "💼", title: "Career & Ambition",        text: report.career },
              { icon: "⚡", title: "Challenges to Navigate",   text: report.challenges },
              { icon: "🌟", title: "Advice for This Pairing",   text: report.advice },
            ].map(({ icon, title, text }) => (
              <div key={title} className="card-mystical p-6 glow-subtle">
                <h3 className="font-decorative text-lg text-highlight mb-3">{icon} {title}</h3>
                <p className="text-text-secondary leading-relaxed">{text}</p>
              </div>
            ))}

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <button onClick={reset} className="btn-primary">Try Another Pair</button>
              <a href="/" className="btn-secondary">Get My Full Reading</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
