"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { loadCredits, consumeCredit, addCredits, type CreditState } from "@/lib/credits";

const TAROT_CARDS = [
  { name: "The Fool", emoji: "🤡" },
  { name: "The Magician", emoji: "🎩" },
  { name: "The High Priestess", emoji: "👸" },
  { name: "The Empress", emoji: "👑" },
  { name: "The Emperor", emoji: "🤴" },
  { name: "The Hierophant", emoji: "📜" },
  { name: "The Lovers", emoji: "💕" },
  { name: "The Chariot", emoji: "🐎" },
  { name: "Strength", emoji: "💪" },
  { name: "The Hermit", emoji: "🧙" },
  { name: "Wheel of Fortune", emoji: "🎡" },
  { name: "Justice", emoji: "⚖️" },
  { name: "The Hanged Man", emoji: "🧗" },
  { name: "Death", emoji: "💀" },
  { name: "Temperance", emoji: "🏺" },
  { name: "The Devil", emoji: "😈" },
  { name: "The Tower", emoji: "🗼" },
  { name: "The Star", emoji: "⭐" },
  { name: "The Moon", emoji: "🌙" },
  { name: "The Sun", emoji: "☀️" },
  { name: "Judgment", emoji: "🔔" },
  { name: "The World", emoji: "🌍" },
];

type TarotReading = {
  overview: string;
  cards: { name: string; position: string; meaning: string; upright: string; reversed: string }[];
  interpretation: string;
  advice: string;
  career: string;
  love: string;
};

export default function TarotPage() {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [creditState, setCreditState] = useState<CreditState>({ credits: 1, email: null, unlocked: false });
  const [error, setError] = useState("");

  const selectCard = (cardName: string) => {
    if (selectedCards.includes(cardName)) {
      setSelectedCards(selectedCards.filter(c => c !== cardName));
    } else if (selectedCards.length < 3) {
      setSelectedCards([...selectedCards, cardName]);
    }
  };

  const analyzeTarot = async () => {
    if (selectedCards.length === 0) {
      setError("Please select at least one card");
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
      const response = await fetch("/api/tarot-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: selectedCards }),
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
    setSelectedCards([]);
    setReading(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-mystical">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1a2e] via-[#1a1a2e] to-transparent py-3 px-4 md:py-4 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <span className="text-2xl md:text-3xl">🃏</span>
            <h1 className="font-decorative text-lg md:text-xl text-highlight">PalmWis Tarot</h1>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/" className="text-xs text-text-secondary hover:text-highlight transition-colors">Palm</Link>
            <Link href="/numerology" className="text-xs text-text-secondary hover:text-highlight transition-colors">Numerology</Link>
          </nav>
        </div>
      </header>

      <section className="pt-24 md:pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="font-decorative text-2xl md:text-3xl mb-3">
            <span className="text-highlight">Tarot</span> Reading
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            Select 3 cards for your reading: Past, Present, and Future
          </p>
        </div>

        {!reading ? (
          <div>
            <div className="flex justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#f5c518]/40 bg-[#f5c518]/10 text-[#f5c518]">
                🔮 {creditState.credits >= 999 ? "∞" : creditState.credits} credits
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
              {TAROT_CARDS.map(({ name, emoji }) => {
                const isSelected = selectedCards.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => selectCard(name)}
                    disabled={!isSelected && selectedCards.length >= 3}
                    className={`card-mystical p-4 text-center transition-all ${
                      isSelected
                        ? "border-[#f5c518] bg-[#f5c518]/10"
                        : "opacity-60 hover:opacity-100"
                    } ${!isSelected && selectedCards.length >= 3 ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-3xl md:text-4xl block mb-2">{emoji}</span>
                    <span className="text-xs text-text-secondary">{name}</span>
                  </button>
                );
              })}
            </div>

            {selectedCards.length > 0 && (
              <div className="text-center mb-6">
                <p className="text-text-secondary text-sm mb-3">
                  Selected: {selectedCards.join(", ")}
                </p>
                <button
                  onClick={analyzeTarot}
                  disabled={isProcessing}
                  className="btn-primary"
                >
                  {isProcessing ? "Reading..." : `🔮 Reveal My Destiny`}
                </button>
                {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="card-mystical p-5 md:p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="font-decorative text-2xl text-highlight mb-2">Your Tarot Reading</h3>
              <p className="text-text-secondary">{reading.overview}</p>
            </div>

            <div className="space-y-4 mb-6">
              {reading.cards.map((card, idx) => (
                <div key={idx} className="border-l-4 border-[#e94560] pl-4 py-2">
                  <p className="text-sm text-highlight font-semibold">{card.position}: {card.name}</p>
                  <p className="text-text-secondary text-sm">{card.meaning}</p>
                </div>
              ))}
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