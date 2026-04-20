"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import EmailGateModal from "@/components/EmailGateModal";
import PaywallModal   from "@/components/PaywallModal";
import {
  loadCredits, consumeCredit, addCredits, unlockWithEmail,
  type CreditState,
} from "@/lib/credits";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type PalmType = "fire" | "earth" | "air" | "water";

interface Reading {
  type: PalmType;
  overview: string;
  majorLines: { title: string; content: string; meaning: string }[];
  mounts: { name: string; content: string; meaning: string }[];
  fingers: { name: string; content: string; meaning: string }[];
  signs: { name: string; content: string; meaning: string }[];
  career: string;
  love: string;
}

interface ToastItem {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}

// ─────────────────────────────────────────────────────────────
// LOCAL FALLBACK ALGORITHM
// ─────────────────────────────────────────────────────────────

// FIX #2: Seed now uses file.size + file.lastModified (real data, not empty File)
function generateSeedFromImage(file: File): number {
  return file.size + file.name.length + Math.floor(file.lastModified / 1000);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function getPalmType(seed: number): PalmType {
  const types: PalmType[] = ["fire", "earth", "air", "water"];
  return types[Math.floor(seededRandom(seed)() * 4)];
}

function generateReading(seed: number): Reading {
  const random = seededRandom(seed);
  const palmType = getPalmType(seed);

  const types: Record<PalmType, { overview: string; traits: string[] }> = {
    fire: {
      overview: "You have a Fire palm, which means you're a natural-born leader with boundless energy and enthusiasm. Your palms show strong qi (life force) flowing through them, indicating a vibrant personality that lights up every room you enter.",
      traits: ["Bold", "spontaneous", "passionate", "energetic", "courageous"],
    },
    earth: {
      overview: "You have an Earth palm, suggesting you're practical, reliable, and grounded. Your strong line structure shows someone who builds lasting foundations and values security above all else.",
      traits: ["Practical", "reliable", "patient", "determined", "sensible"],
    },
    air: {
      overview: "You have an Air palm, revealing an intellectual, analytical mind. Your palm lines show complex thinking patterns and a natural curiosity about the world around you.",
      traits: ["Curious", "analytical", "social", "communicative", "inventive"],
    },
    water: {
      overview: "You have a Water palm, indicating a highly intuitive and emotional nature. Your palm shows deep sensitivity and creative potential, with feelings that run deep like the oceans.",
      traits: ["Intuitive", "creative", "emotional", "adaptable", "artistic"],
    },
  };

  const type = types[palmType];
  const traits = [...type.traits].sort(() => random() - 0.5).slice(0, 3);

  const lifeLineMeanings = [
    "Your Life Line starts strong and curves gently, suggesting robust health and vitality throughout your life. You have good natural defenses against illness.",
    "The Life Line shows some breaks, indicating you've faced or will face significant transformations. These changes, while challenging, ultimately strengthen your character.",
    "A deep and well-defined Life Line speaks of physical strength and the will to live fully. You likely have plenty of energy to pursue your dreams.",
    "The Life Line wraps closely around the thumb, meaning you're someone who values independence and personal freedom above comfort.",
  ];
  const heartLineMeanings = [
    "Your Heart Line starts under the index finger, suggesting you approach love with logic and caution. You're loyal once committed, but take time to open up emotionally.",
    "A Heart Line that reaches all the way to the index finger indicates a passionate nature. You love deeply and aren't afraid to show your emotions.",
    "The Heart Line is straight and shallow, showing you keep emotional distance. You prefer practical displays of affection over dramatic expressions.",
    "Your Heart Line has a fork at the end, suggesting emotional balance — you can balance personal needs with your partner's needs.",
  ];
  const headLineMeanings = [
    "Your Head Line is long and well-defined, showing strong analytical abilities. You're a logical thinker who considers all angles before making decisions.",
    "A slightly curved Head Line indicates creative thinking. You don't just see facts — you see possibilities and connections others miss.",
    "The Head Line starts separate from the Life Line, showing independent thinking. You form your own opinions and aren't easily influenced by others.",
    "A forked Head Line suggests versatile thinking — you can approach problems from multiple angles simultaneously.",
  ];
  const fateLineMeanings = [
    "A visible Fate Line shows you're someone who shapes their own destiny. You're not just carried by life — you steer your own course.",
    "Your Fate Line is faint or broken, suggesting an adaptable life path. You're flexible and can succeed in various circumstances.",
    "No strong Fate Line means you're free to create your own path without predetermined constraints. This is freedom, not limitation.",
  ];

  const mounts = [
    { name: "Mount of Venus", content: "Well-developed and plump, indicating natural charm and magnetic personality.", meaning: "You're naturally lovable and have an easy time forming relationships." },
    { name: "Mount of Jupiter", content: "Prominent and strong, showing natural leadership abilities.", meaning: "You're destined for roles where you can lead and inspire others." },
    { name: "Mount of Saturn", content: "Well-defined, indicating wisdom beyond your years.", meaning: "You bring stability to any situation and others look to you for guidance." },
    { name: "Mount of Mercury", content: "Showing good development, suggesting strong communication skills.", meaning: "You have the gift of persuasion — careers in communication suit you well." },
    { name: "Upper Mars", content: "Strong and well-defined, showing courage and fighting spirit.", meaning: "You have the bravery to face any obstacle." },
    { name: "Lower Mars", content: "Well-developed, indicating persistence and determination.", meaning: "Your determination is unmatched — setbacks make you more driven." },
    { name: "Mount of Moon", content: "Showing good development, indicating imagination and intuition.", meaning: "Your intuition is strong. Trust your gut feelings — they're often right." },
  ];
  const fingers = [
    { name: "Index Finger (Jupiter)", content: "Longer than average, showing strong ambition and desire for recognition.", meaning: "You're driven by success and status. Channel this into meaningful goals." },
    { name: "Middle Finger (Saturn)", content: "Well-proportioned, indicating balanced sense of responsibility.", meaning: "You have natural self-discipline that helps you stay on track." },
    { name: "Ring Finger (Apollo)", content: "Prominent, showing appreciation for beauty and creativity.", meaning: "Beauty matters to you — creative expression is a need, not a luxury." },
    { name: "Little Finger (Mercury)", content: "Well-developed, suggesting strong communication skills.", meaning: "Communication is your strength. Use it in writing, speaking, or teaching." },
    { name: "Thumb", content: "Strong and well-angled, showing good willpower and determination.", meaning: "You have the strength of character to stand by your convictions." },
  ];
  const signs = [
    { name: "Star Mark", content: "A rare star marking present on your palm, indicating potential for distinction.", meaning: "You're capable of extraordinary things in your field." },
    { name: "Triangle", content: "A clear triangle formation in your palm, indicating wisdom.", meaning: "Your mind is your greatest asset — you synthesize information brilliantly." },
    { name: "Circle (Ring)", content: "A ring marking visible, suggesting a self-contained nature.", meaning: "You don't need external validation — you have everything within yourself." },
    { name: "Cross Mark", content: "A cross marking present, indicating moments of decision or change.", meaning: "Challenges you face are actually turning points — embrace them." },
    { name: "Island", content: "An island marking visible, indicating a period of transformation.", meaning: "You're in or approaching a transformative phase. You emerge stronger." },
  ];
  const careerTraits = [
    "Your strong finger definition suggests success in fields that require communication. Teaching, writing, or sales could be fulfilling.",
    "The mounts of your palm indicate natural leadership abilities. Management or entrepreneurial roles play to your strengths.",
    "Your creative mount development suggests an artistic streak. Consider careers that allow creative expression.",
    "Your analytical Head Line points to success in technical or scientific fields where logic is prized.",
    "Your well-developed Mercury mount suggests business acumen. Entrepreneurship or finance could be natural fits.",
  ];
  const loveTraits = [
    "Your Heart Line suggests you need a partner who respects your independence. Clinginess is a red flag for you.",
    "The shape of your Mount of Venus indicates you attract partners easily. Your natural charm works in your favor.",
    "Your approach to love is practical but deep. You don't show off, but when you love, you love completely.",
    "You seek a partner who can match your intellectual energy. Conversation and mental connection are important to you.",
    "Your emotional nature means you feel deeply in relationships. Partner with someone who appreciates your depth.",
  ];

  const mountCount = Math.floor(random() * 3) + 5;
  const fingerCount = Math.floor(random() * 2) + 4;
  const signCount = Math.floor(random() * 2) + 3;

  return {
    type: palmType,
    overview: type.overview,
    majorLines: [
      { title: "Life Line", content: lifeLineMeanings[Math.floor(random() * lifeLineMeanings.length)], meaning: traits[0] },
      { title: "Heart Line", content: heartLineMeanings[Math.floor(random() * heartLineMeanings.length)], meaning: traits[1] },
      { title: "Head Line", content: headLineMeanings[Math.floor(random() * headLineMeanings.length)], meaning: traits[2] },
      { title: "Fate Line", content: fateLineMeanings[Math.floor(random() * fateLineMeanings.length)], meaning: "Your approach to success" },
    ],
    mounts: [...mounts].sort(() => random() - 0.5).slice(0, mountCount),
    fingers: [...fingers].sort(() => random() - 0.5).slice(0, fingerCount),
    signs: [...signs].sort(() => random() - 0.5).slice(0, signCount),
    career: careerTraits[Math.floor(random() * careerTraits.length)],
    love: loveTraits[Math.floor(random() * loveTraits.length)],
  };
}

// ─────────────────────────────────────────────────────────────
// TOAST COMPONENT
// ─────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 no-print pointer-events-none" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} pointer-events-auto`}
          onClick={() => onRemove(toast.id)}
          role="alert"
        >
          <span className="text-base flex-shrink-0">
            {toast.type === "error" ? "⚠️" : toast.type === "success" ? "✅" : "ℹ️"}
          </span>
          <p className="text-sm leading-snug flex-1">{toast.message}</p>
          <button aria-label="Dismiss" className="ml-1 opacity-60 hover:opacity-100 text-xs flex-shrink-0">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHOTO GUIDE MODAL (Phase 2 #5)
// ─────────────────────────────────────────────────────────────

function PhotoGuideModal({ onClose }: { onClose: () => void }) {
  const tips = [
    { icon: "✋", tip: "Use your dominant hand (right if right-handed)" },
    { icon: "🤚", tip: "Hold your hand flat with fingers slightly spread open" },
    { icon: "☀️", tip: "Shoot in natural daylight or bright indoor light" },
    { icon: "🔦", tip: "Face towards the light — avoid shadows across the palm" },
    { icon: "📐", tip: "Hold camera 6–12 inches directly above your palm" },
    { icon: "🎯", tip: "Make sure all major palm lines are clearly in focus" },
  ];
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm no-print"
      onClick={onClose}
    >
      <div
        className="card-mystical p-8 max-w-md w-full mx-4 glow-subtle"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-decorative text-xl text-highlight mb-6 text-center">📸 Perfect Palm Photo Guide</h3>
        <ul className="space-y-4">
          {tips.map(({ icon, tip }) => (
            <li key={tip} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-text-secondary text-sm leading-relaxed">{tip}</p>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="btn-primary w-full mt-8">
          Got It — Let&apos;s Read My Palm!
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reading, setReading] = useState<Reading | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dragOver, setDragOver] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);

  // ── Phase 3 state ───────────────────────────────────────────
  const [creditState, setCreditState] = useState<CreditState>({ credits: 1, email: null, unlocked: false });
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [showPaywall,   setShowPaywall]   = useState(false);
  const [pendingTab,    setPendingTab]    = useState<string | null>(null);
  const [shareUrl,      setShareUrl]      = useState<string | null>(null);
  const [savingShare,   setSavingShare]   = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Toasts ──────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── localStorage restore + credit load (Phase 2 #9 / Phase 3) ──
  useEffect(() => {
    // Load credits
    setCreditState(loadCredits());
    try {
      const savedReading  = localStorage.getItem("palmwiz_reading");
      const savedImage    = localStorage.getItem("palmwiz_image");
      const savedFileName = localStorage.getItem("palmwiz_filename");
      const savedShare    = localStorage.getItem("palmwiz_share_url");
      if (savedReading && savedImage) {
        setReading(JSON.parse(savedReading));
        setImage(savedImage);
        setFileName(savedFileName || "");
        setProgress(100);
        if (savedShare) setShareUrl(savedShare);
        addToast("Your previous reading has been restored!", "info");
      }
    } catch {
      // ignore parse / quota errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Phase 3: tab click with email gate ──────────────────────
  const handleTabClick = useCallback((tabId: string) => {
    if (tabId === "overview" || creditState.unlocked) {
      setActiveTab(tabId);
      return;
    }
    // Gate — save which tab they wanted
    setPendingTab(tabId);
    setShowEmailGate(true);
  }, [creditState.unlocked]);

  // ── Phase 3: email unlock handler ────────────────────────────
  const handleEmailUnlock = useCallback(async (email: string) => {
    const next = unlockWithEmail(creditState, email);
    setCreditState(next);
    setShowEmailGate(false);
    if (pendingTab) { setActiveTab(pendingTab); setPendingTab(null); }
    addToast("Full reading unlocked! 3 free readings active. 🎉", "success");
    // Save reading to DB + get share URL
    if (reading) {
      setSavingShare(true);
      try {
        const res = await fetch("/api/readings/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, reading, palmType: reading.type }),
        });
        const d = await res.json();
        if (d.shareToken && d.configured) {
          const url = `${window.location.origin}/reading/${d.shareToken}`;
          setShareUrl(url);
          try { localStorage.setItem("palmwiz_share_url", url); } catch { /* quota */ }
        }
      } catch { /* non-fatal */ } finally { setSavingShare(false); }
    }
  }, [creditState, pendingTab, reading, addToast]);

  // ── Phase 3: paywall success handler ────────────────────────
  const handlePaymentSuccess = useCallback((credits: number) => {
    const next = addCredits(creditState, credits);
    setCreditState(next);
    setShowPaywall(false);
    addToast(`Payment successful! ${credits >= 999 ? "Unlimited readings active" : `${credits} credits added`} 🎉`, "success");
  }, [creditState, addToast]);

  // ── File handling ────────────────────────────────────────────
  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        addToast("Please upload a JPEG, PNG, or WebP image", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        addToast("File size must be less than 10MB", "error");
        return;
      }
      setCurrentFile(file); // FIX #2 — store actual File object
      const reader = new FileReader();
      reader.onload = e => {
        setImage(e.target?.result as string);
        setFileName(file.name);
        setReading(null);
        setProgress(0);
      };
      reader.readAsDataURL(file);
    },
    [addToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // allow re-selecting same file
  };

  // ── Palm analysis — Phase 1 fixes + Phase 3 credit check ───
  const analyzePalm = async () => {
    if (!image) return;
    // Credit gate
    if (creditState.credits <= 0) { setShowPaywall(true); return; }
    const nextCredits = consumeCredit(creditState);
    setCreditState(nextCredits);
    setShareUrl(null);
    setIsProcessing(true);
    setProgress(0);
    setReading(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.random() * 10;
      });
    }, 300);

    try {
      const response = await fetch("/api/palm-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, fileName }),
      });

      clearInterval(interval);
      const data = await response.json();

      if (response.status === 429) {
        addToast(data.error || "Too many readings — please try again later", "error");
        setIsProcessing(false); // FIX #1
        setProgress(0);
        return;
      }

      // Hand detection failed - return credit
      if (response.status === 411) {
        addToast(data.error || "Please upload a photo of your hand", "error");
        setIsProcessing(false);
        setProgress(0);
        // Return the credit since we didn't use it
        const refunded = { ...creditState, credits: creditState.credits + 1 };
        setCreditState(refunded);
        return;
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || "API unavailable");
      }

      setReading(data.reading);
      setProgress(100);
      setIsProcessing(false);

      try {
        localStorage.setItem("palmwiz_reading", JSON.stringify(data.reading));
        localStorage.setItem("palmwiz_image", image);
        localStorage.setItem("palmwiz_filename", fileName);
        localStorage.removeItem("palmwiz_share_url");
      } catch { /* quota exceeded — ignore */ }

    } catch (error) {
      clearInterval(interval);
      console.warn("AI unavailable, using local algorithm:", error);
      addToast("AI analysis unavailable — using classic reading algorithm", "info");

      // FIX #2: use actual stored File for a meaningful seed
      const seed = currentFile ? generateSeedFromImage(currentFile) : Date.now();
      const result = generateReading(seed);

      setReading(result);
      setProgress(100);
      setIsProcessing(false); // FIX #1

      try {
        localStorage.setItem("palmwiz_reading", JSON.stringify(result));
        localStorage.setItem("palmwiz_image", image);
        localStorage.setItem("palmwiz_filename", fileName);
      } catch { /* quota exceeded — ignore */ }
    }
  };

  // ── Reset ────────────────────────────────────────────────────
  const reset = () => {
    setImage(null);
    setFileName("");
    setCurrentFile(null);
    setReading(null);
    setProgress(0);
    setActiveTab("overview");
    setShareUrl(null);
    try {
      localStorage.removeItem("palmwiz_reading");
      localStorage.removeItem("palmwiz_image");
      localStorage.removeItem("palmwiz_filename");
      localStorage.removeItem("palmwiz_share_url");
    } catch { /* ignore */ }
  };

  const scrollToUpload = () =>
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });

  // ── Auto-scroll (now works because isProcessing is properly cleared) ──
  useEffect(() => {
    if (!isProcessing && progress === 100 && reading) {
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [isProcessing, progress, reading]);

  // ── Share / Save as PDF (Phase 2 #7) ────────────────────────
  const printReading = () => window.print();

  const shareReading = async () => {
    if (!reading) return;
    const palmEmoji = reading.type === "fire" ? "🔥" : reading.type === "earth" ? "🌍" : reading.type === "air" ? "💨" : "💧";
    // Prefer the DB share URL; fall back to text share
    const url  = shareUrl ?? "https://palmwis.app";
    const text = `${palmEmoji} I just got my palm read on PalmWis!\n\nI have a ${reading.type.charAt(0).toUpperCase() + reading.type.slice(1)} palm — ${reading.overview.slice(0, 100)}...\n\nSee my full reading: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My PalmWis Reading", text, url });
      } else {
        await navigator.clipboard.writeText(url !== "https://palmwis.app" ? url : text);
        addToast(shareUrl ? "Share link copied! 🔗" : "Reading copied to clipboard! 🖐️", "success");
      }
    } catch {
      addToast("Could not share — try copying manually", "error");
    }
  };

  // ── Tabs & particles ─────────────────────────────────────────
  const tabs = [
    { id: "overview",   label: "Overview"     },
    { id: "majorLines", label: "Major Lines"  },
    { id: "mounts",     label: "Mounts"       },
    { id: "fingers",    label: "Fingers"      },
    { id: "signs",      label: "Signs & Marks"},
    { id: "career",     label: "Career"       },
    { id: "love",       label: "Love"         },
  ];

  const particles = useMemo(
    () =>
      [...Array(15)].map((_, i) => ({
        left: `${(i * 7 + 3) % 100}%`,
        animationDelay: `${i * 0.4}s`,
        animationDuration: `${5 + (i % 4)}s`,
        width: `${2 + (i % 3)}px`,
        height: `${2 + (i % 3)}px`,
      })),
    []
  );

  const progressLabel =
    progress < 35 ? "Uploading image..." :
    progress < 65 ? "Reading your palm lines..." :
    progress < 85 ? "Interpreting the mounts..." :
    "Revealing your destiny...";

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-mystical">
      {/* Toast container (Phase 2 #11) */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Email gate modal (Phase 3 #12) */}
      {showEmailGate && (
        <EmailGateModal
          onUnlock={handleEmailUnlock}
          onClose={() => { setShowEmailGate(false); setPendingTab(null); }}
        />
      )}

      {/* Paywall modal (Phase 3 #14) */}
      {showPaywall && (
        <PaywallModal
          email={creditState.email}
          credits={creditState.credits}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Photo guide modal (Phase 2 #5) */}
      {showPhotoGuide && <PhotoGuideModal onClose={() => setShowPhotoGuide(false)} />}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload palm photo"
      />
      {/* Camera input for mobile (Phase 2 #6) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Take palm photo with camera"
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden no-print" style={{ zIndex: 0 }}>
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
              width: p.width,
              height: p.height,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1a2e] to-transparent py-4 px-6 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🖐️</span>
            <h1 className="font-decorative text-xl text-highlight">PalmWis</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Credit badge (Phase 3 #13) */}
            <div
              onClick={() => setShowPaywall(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors hover:scale-105
                ${
                  creditState.credits === 0
                    ? "border-[#e94560]/60 bg-[#e94560]/10 text-[#e94560] hover:bg-[#e94560]/20"
                    : "border-[#f5c518]/40 bg-[#f5c518]/10 text-[#f5c518]"
                }`}
            >
              🔮 {creditState.credits >= 999 ? "Unlimited" : `${creditState.credits} reading${creditState.credits !== 1 ? "s" : ""} left`}
            </div>
            {reading && !isProcessing && (
              <button onClick={reset} className="btn-secondary text-sm py-2 px-5">New Reading</button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 no-print">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h1
            className="font-decorative text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
            style={{ textShadow: "0 0 40px rgba(233, 69, 96, 0.3)" }}
          >
            Discover Your Destiny<br />
            <span className="text-highlight">Written in Your Palm</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-2xl mx-auto font-body">
            Ancient palmistry wisdom made simple. Upload your palm photo and uncover the secrets written in your hand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={scrollToUpload} className="btn-primary text-lg">
              Read My Palm
            </button>
            <a
              href="/compatibility"
              className="btn-secondary text-lg flex items-center gap-2 justify-center"
            >
              💞 Compatibility
            </a>
            <button
              onClick={() => setShowPhotoGuide(true)}
              className="btn-secondary text-lg flex items-center gap-2 justify-center"
            >
              📸 Photo Tips
            </button>
          </div>
        </div>
        <div className="mt-16 text-9xl opacity-20 animate-pulse">🖐️</div>
      </section>

      {/* ── Upload Section ─────────────────────────────────────── */}
      <section id="upload-section" className="relative py-20 px-6 no-print">
        <div className="max-w-3xl mx-auto">
          {!image ? (
            <div className="fade-in">
              {/* Drag & drop zone */}
              <div
                id="drop-zone"
                className={`upload-zone ${dragOver ? "dragover" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                aria-label="Upload palm photo"
                onKeyDown={e => e.key === "Enter" && handleClick()}
              >
                <div className="text-6xl mb-6">📷</div>
                <h2 className="font-decorative text-2xl mb-4">Drop Your Palm Photo Here</h2>
                <p className="text-text-secondary mb-2">or click to browse files</p>
                <p className="text-sm text-text-secondary">Supports: JPEG, PNG, WebP · max 10MB</p>
              </div>

              {/* Mobile camera + guide buttons (Phase 2 #6) */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-secondary flex items-center justify-center gap-2"
                  aria-label="Take photo with camera"
                >
                  📱 Open Camera
                </button>
                <button
                  onClick={() => setShowPhotoGuide(true)}
                  className="btn-secondary flex items-center justify-center gap-2"
                  aria-label="View palm photo guide"
                >
                  ❓ Photo Guide
                </button>
              </div>
            </div>
          ) : (
            <div className="fade-in">
              <div className="card-mystical p-8 glow-subtle">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Image preview */}
                  <div className="relative flex-shrink-0 w-full md:w-auto">
                    <div className="relative max-w-[280px] mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="Uploaded palm"
                        className="w-full rounded-xl shadow-2xl"
                        style={{ border: "3px solid rgba(233, 69, 96, 0.3)" }}
                      />
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl overflow-hidden">
                          <div className="scan-line" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-2 text-center truncate max-w-[280px] mx-auto">
                      {fileName}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-decorative text-2xl mb-4 text-highlight">
                      {isProcessing ? "Reading Your Palm..." : "Ready to Analyze"}
                    </h3>

                    {isProcessing ? (
                      <div className="mb-4">
                        <div className="w-full bg-[#16213e] rounded-full h-3 overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-[#e94560] to-[#f5c518] transition-all duration-300 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <p className="text-text-secondary text-sm">{progressLabel}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <p className="text-text-secondary">
                          Your palm is ready to be read. Click below to reveal the ancient wisdom written in your hand.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                          <button onClick={analyzePalm} className="btn-primary">
                            ✨ Analyze Palm
                          </button>
                          <button onClick={reset} className="btn-secondary">
                            Choose Different Photo
                          </button>
                        </div>
                        <button
                          onClick={() => setShowPhotoGuide(true)}
                          className="text-sm text-text-secondary hover:text-highlight transition-colors"
                        >
                          📸 Tips for a better reading
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Results Section ────────────────────────────────────── */}
      {reading && !isProcessing && (
        <section id="results" className="relative py-20 px-6">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12 fade-in">
              <h2 className="font-decorative text-3xl md:text-4xl mb-4">
                Your <span className="text-highlight">Palm Reading</span>
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Based on the ancient art of palmistry, here is what your unique palm reveals about your personality, destiny, and potential.
              </p>
            </div>

            {/* Palm type badge */}
            <div className="flex justify-center mb-8 fade-in delay-1">
              <div className="card-mystical px-8 py-4 glow-gold inline-flex items-center gap-4">
                <span className="text-3xl">
                  {reading.type === "fire" ? "🔥" : reading.type === "earth" ? "🌍" : reading.type === "air" ? "💨" : "💧"}
                </span>
                <div>
                  <p className="text-sm text-text-secondary uppercase tracking-wider">Palm Type</p>
                  <p className="font-decorative text-xl text-highlight capitalize">{reading.type} Element</p>
                </div>
              </div>
            </div>

            {/* Scrollable tabs — Phase 2 #8 | gated — Phase 3 #12 */}
            <div className="tabs-scroll fade-in delay-2 mb-8" role="tablist">
              <div className="flex gap-1 min-w-max px-2 md:justify-center">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`tab-button whitespace-nowrap ${activeTab === tab.id ? "active" : ""} relative`}
                  >
                    {tab.label}
                    {/* Lock icon on gated tabs */}
                    {tab.id !== "overview" && !creditState.unlocked && (
                      <span className="ml-1 text-xs opacity-50">🔒</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="card-mystical p-8 glow-subtle fade-in delay-3">

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-decorative text-2xl mb-4 text-highlight">Your True Nature</h3>
                    <p className="text-lg leading-relaxed text-text-primary">{reading.overview}</p>
                  </div>
                  <div className="border-t border-[#16213e] pt-6">
                    <h4 className="font-decorative text-xl mb-4">What This Means For You</h4>
                    <p className="text-text-secondary leading-relaxed">
                      Your palm type reveals your core essence. Understanding whether you radiate Fire energy, stand grounded like Earth, think freely like Air, or flow intuitively like Water helps you make decisions that align with your true self. This wisdom has been used for thousands of years to help people understand their natural strengths and live more fulfilling lives.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "majorLines" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">The Major Lines of Your Palm</h3>
                  {reading.majorLines.map((line, idx) => (
                    <div key={idx} className="border-l-4 border-[#e94560] pl-6 py-2">
                      <h4 className="font-decorative text-xl mb-3">{line.title} Line</h4>
                      <p className="text-text-primary mb-4">{line.content}</p>
                      <div className="bg-[#16213e] rounded-lg p-4">
                        <p className="text-sm text-highlight font-medium">✨ What This Means For You:</p>
                        <p className="text-sm text-text-secondary mt-1">{line.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "mounts" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">The Seven Mounts of Your Palm</h3>
                  <p className="text-text-secondary mb-6">
                    The mounts are the fleshy mounds at the base of each finger. Their development reveals your personality traits and potentials.
                  </p>
                  {reading.mounts.map((mount, idx) => (
                    <div key={idx} className="bg-[#16213e] rounded-xl p-6">
                      <h4 className="font-decorative text-lg mb-3 text-accent">{mount.name}</h4>
                      <p className="text-text-primary mb-3">{mount.content}</p>
                      <div className="border-t border-[#252545] pt-3">
                        <p className="text-sm text-highlight">✨ Meaning:</p>
                        <p className="text-sm text-text-secondary mt-1">{mount.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "fingers" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">Your Fingers Tell the Story</h3>
                  <p className="text-text-secondary mb-6">
                    The length and proportion of your fingers reveal your personality traits and natural inclinations.
                  </p>
                  {reading.fingers.map((finger, idx) => (
                    <div key={idx} className="bg-[#16213e] rounded-xl p-6">
                      <h4 className="font-decorative text-lg mb-3 text-accent">{finger.name}</h4>
                      <p className="text-text-primary mb-3">{finger.content}</p>
                      <div className="border-t border-[#252545] pt-3">
                        <p className="text-sm text-highlight">✨ Meaning:</p>
                        <p className="text-sm text-text-secondary mt-1">{finger.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "signs" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">Special Signs &amp; Marks</h3>
                  <p className="text-text-secondary mb-6">
                    These unique markings on your palm are considered significant in palmistry, indicating special gifts or life events.
                  </p>
                  {reading.signs.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">
                      Your palm shows fewer prominent special marks, suggesting a clean, straightforward path in life.
                    </p>
                  ) : reading.signs.map((sign, idx) => (
                    <div key={idx} className="bg-[#16213e] rounded-xl p-6">
                      <h4 className="font-decorative text-lg mb-3 text-accent">{sign.name}</h4>
                      <p className="text-text-primary mb-3">{sign.content}</p>
                      <div className="border-t border-[#252545] pt-3">
                        <p className="text-sm text-highlight">✨ Meaning:</p>
                        <p className="text-sm text-text-secondary mt-1">{sign.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "career" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">Career &amp; Success</h3>
                  <div className="bg-[#16213e] rounded-xl p-8">
                    <p className="text-lg text-text-primary mb-6">{reading.career}</p>
                    <div className="border-t border-[#252545] pt-6">
                      <h4 className="font-decorative text-xl mb-4 text-highlight">Your Career Wisdom</h4>
                      <p className="text-text-secondary leading-relaxed mb-4">
                        Your palm reveals natural talents that, when developed, can lead to fulfilling careers. The mounts and lines work together to show where your strengths lie.
                      </p>
                      <p className="text-text-secondary leading-relaxed">
                        Consider paths that align with your core nature. Fire types thrive in leadership. Earth types in stable, practical work. Air types in intellectual fields. Water types in creative or helping professions.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-[#e94560]/20 to-[#f5c518]/20 rounded-xl p-6 border border-[#e94560]/30">
                    <p className="text-highlight font-medium">💡 Pro Tip:</p>
                    <p className="text-text-secondary mt-2">
                      Your fingers and mounts together paint the complete picture. Trust your instincts when choosing career paths — your palm has been guiding thousands toward their destiny for millennia.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "love" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">Love &amp; Relationships</h3>
                  <div className="bg-[#16213e] rounded-xl p-8">
                    <p className="text-lg text-text-primary mb-6">{reading.love}</p>
                    <div className="border-t border-[#252545] pt-6">
                      <h4 className="font-decorative text-xl mb-4 text-highlight">Your Love Language</h4>
                      <p className="text-text-secondary leading-relaxed mb-4">
                        The Mount of Venus and your Heart Line work together to reveal how you give and receive love.
                      </p>
                      <p className="text-text-secondary leading-relaxed">
                        Your natural style may differ from what society expects. Understanding your palm helps you communicate your needs clearly to partners.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-[#e94560]/20 to-[#f5c518]/20 rounded-xl p-6 border border-[#e94560]/30">
                    <p className="text-highlight font-medium">💡 Pro Tip:</p>
                    <p className="text-text-secondary mt-2">
                      No palm is exactly alike — your unique combination of lines, mounts, and marks makes your approach to love entirely your own. Embrace what makes you different.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Share URL banner (Phase 3 #16) */}
            {shareUrl && (
              <div className="mt-6 fade-in">
                <div className="card-mystical p-4 border border-[#f5c518]/30 flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-2xl flex-shrink-0">🔗</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-highlight text-sm font-semibold mb-1">Your shareable reading link</p>
                    <p className="text-text-secondary text-xs truncate">{shareUrl}</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(shareUrl); addToast("Link copied!", "success"); }}
                    className="btn-secondary text-sm py-2 px-4 flex-shrink-0"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}
            {savingShare && (
              <p className="text-center text-xs text-text-secondary mt-3 animate-pulse">Saving your reading...</p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 fade-in delay-4 no-print">
              <button onClick={shareReading} className="btn-primary flex items-center gap-2">
                🔗 Share Reading
              </button>
              <button onClick={printReading} className="btn-secondary flex items-center gap-2">
                📄 Save as PDF
              </button>
              <a href="/compatibility" className="btn-secondary flex items-center gap-2">
                💞 Compatibility Reading
              </a>
              <button onClick={reset} className="btn-secondary flex items-center gap-2">
                🖐️ New Reading
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-[#252545] no-print">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-6">🖐️</div>
          <p className="text-text-secondary mb-4 text-sm max-w-2xl mx-auto">
            Palmistry is an ancient art practiced for thousands of years across many cultures.
            This reading is for entertainment purposes only and should not be used as the sole basis
            for major life decisions.
          </p>
          <p className="text-xs text-text-secondary">
            © PalmWis — Bringing ancient wisdom to the modern world
          </p>
        </div>
      </footer>
    </main>
  );
}