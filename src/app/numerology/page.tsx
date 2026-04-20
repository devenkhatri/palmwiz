"use client";

import { useState } from "react";
import Link from "next/link";
import { loadCredits, consumeCredit, type CreditState } from "@/lib/credits";

type NumerologyReading = {
  overview: string;
  lifePath: { number: number; meaning: string };
  expression: { number: number; meaning: string };
  soulUrge: { number: number; meaning: string };
  personalYear: { number: number; year: number; meaning: string };
  destiny: string;
  career: string;
  love: string;
  advice: string;
  calculations: { lifePath: number; expression: number; soulUrge: number; personalYear: number };
};

export default function NumerologyPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [reading, setReading] = useState<NumerologyReading | null>(null);
  const [creditState, setCreditState] = useState<CreditState>({ credits: 1, email: null, unlocked: false });
  const [error, setError] = useState("");

  const analyzeNumerology = async () => {
    if (!name.trim() || !dob) {
      setError("Please enter your name and date of birth");
      return;
    }

    if (creditState.credits <= 0) {
      setError("No credits left. Add more readings to continue.");
      return;
    }

    const nextCredits = consumeCredit(creditState);
    setCreditState(nextCredits);
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/numerology-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), dob }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Failed to generate reading");
        setIsProcessing(false);
        return;
      }

      setReading(data.reading);
    } catch {
      setError("Failed to generate reading");
    }

    setIsProcessing(false);
  };

  const reset = () => {
    setName("");
    setDob("");
    setReading(null);
    setError("");
  };

  const getEmoji = (num: number) => {
    const emojis = ["", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    return emojis[num] || "✨";
  };

  return (
    <main className="min-h-screen bg-mystical">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1a2e] via-[#1a1a2e] to-transparent py-3 px-4 md:py-4 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-3xl">🔢</span>
            <h1 className="font-decorative text-lg md:text-xl text-highlight">PalmWis Numerology</h1>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/" className="text-xs text-text-secondary hover:text-highlight transition-colors">Palm</Link>
            <Link href="/tarot" className="text-xs text-text-secondary hover:text-highlight transition-colors">Tarot</Link>
          </nav>
        </div>
      </header>

      <section className="pt-24 md:pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="font-decorative text-2xl md:text-3xl mb-3">
            <span className="text-highlight">Numerology</span> Reading
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            Discover the hidden meanings in your name and birth date
          </p>
        </div>

        {!reading ? (
          <div className="max-w-md mx-auto">
            <div className="flex justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#f5c518]/40 bg-[#f5c518]/10 text-[#f5c518]">
                🔮 {creditState.credits >= 999 ? "∞" : creditState.credits} credits
              </div>
            </div>

            <div className="card-mystical p-5 md:p-8 space-y-5">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full birth name"
                  className="w-full px-4 py-3 rounded-xl bg-[#16213e] border border-[#e94560]/30 text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-[#e94560] transition-colors text-base"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#16213e] border border-[#e94560]/30 text-text-primary outline-none focus:border-[#e94560] transition-colors text-base"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={analyzeNumerology}
                disabled={isProcessing}
                className="btn-primary w-full"
              >
                {isProcessing ? "Calculating..." : "🔮 Reveal My Numbers"}
              </button>
            </div>
          </div>
        ) : (
          <div className="card-mystical p-5 md:p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="font-decorative text-2xl text-highlight mb-2">Your Numerology Reading</h3>
              <p className="text-text-secondary">{reading.overview}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-mystical p-4 text-center">
                <span className="text-3xl block mb-1">{getEmoji(reading.calculations.lifePath)}</span>
                <p className="text-xs text-text-secondary">Life Path</p>
                <p className="font-decorative text-highlight">{reading.lifePath.number}</p>
              </div>
              <div className="card-mystical p-4 text-center">
                <span className="text-3xl block mb-1">{getEmoji(reading.calculations.expression)}</span>
                <p className="text-xs text-text-secondary">Expression</p>
                <p className="font-decorative text-highlight">{reading.expression.number}</p>
              </div>
              <div className="card-mystical p-4 text-center">
                <span className="text-3xl block mb-1">{getEmoji(reading.calculations.soulUrge)}</span>
                <p className="text-xs text-text-secondary">Soul Urge</p>
                <p className="font-decorative text-highlight">{reading.soulUrge.number}</p>
              </div>
              <div className="card-mystical p-4 text-center">
                <span className="text-3xl block mb-1">{getEmoji(reading.calculations.personalYear)}</span>
                <p className="text-xs text-text-secondary">Personal Year {reading.personalYear.year}</p>
                <p className="font-decorative text-highlight">{reading.personalYear.number}</p>
              </div>
            </div>

            <div className="border-t border-[#252545] pt-4 mb-4">
              <p className="text-sm text-highlight font-semibold mb-1">Your Destiny</p>
              <p className="text-text-secondary text-sm">{reading.destiny}</p>
            </div>

            <div className="border-t border-[#252545] pt-4 mb-4">
              <p className="text-sm text-highlight font-semibold mb-1"> Guidance</p>
              <p className="text-text-secondary text-sm">{reading.advice}</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-secondary">New Reading</button>
              <Link href="/" className="btn-primary">Palm Reading</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}