"use client";

import { useState } from "react";

interface Props {
  onUnlock: (email: string) => void;
  onClose: () => void;
}

export default function EmailGateModal({ onUnlock, onClose }: Props) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    // Small artificial delay for feel
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    onUnlock(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm no-print"
      onClick={onClose}
    >
      <div
        className="card-mystical max-w-md w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-[#e94560]/30 to-[#f5c518]/20 p-8 text-center border-b border-[#e94560]/20">
          <div className="text-5xl mb-3">🔮</div>
          <h2 className="font-decorative text-2xl text-highlight mb-2">Unlock Your Full Reading</h2>
          <p className="text-text-secondary text-sm">
            Your Overview is ready. Enter your email to unlock all 7 sections — for free.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-8 pt-6">
          <ul className="space-y-3 mb-6">
            {[
              { icon: "✨", text: "Major Lines, Mounts, Fingers & more" },
              { icon: "💼", text: "Career & Love compatibility insights" },
              { icon: "🔗", text: "Shareable reading link to save & share" },
              { icon: "🎁", text: "3 free readings per month — no card needed" },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-sm text-text-secondary">{text}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#16213e] border border-[#e94560]/30 text-text-primary placeholder-text-secondary/50 outline-none focus:border-[#e94560] transition-colors font-body text-sm"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Unlocking..." : "✨ Unlock Full Reading — Free"}
            </button>
          </form>
        </div>

        <div className="px-8 pb-6 pt-3 text-center">
          <p className="text-xs text-text-secondary">
            No spam, ever. Unsubscribe anytime.
          </p>
          <button
            onClick={onClose}
            className="mt-2 text-xs text-text-secondary/60 hover:text-text-secondary transition-colors"
          >
            Maybe later — stay on Overview
          </button>
        </div>
      </div>
    </div>
  );
}
