"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";

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

function generateSeedFromImage(file: File): number {
  return file.size + file.name.length + Date.now();
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function getPalmType(seed: number): PalmType {
  const types: PalmType[] = ["fire", "earth", "air", "water"];
  const random = seededRandom(seed);
  return types[Math.floor(random() * 4)];
}

function generateReading(seed: number): Reading {
  const random = seededRandom(seed);
  const palmType = getPalmType(seed);

  const types: Record<PalmType, { overview: string; traits: string[] }> = {
    fire: {
      overview: "You have a Fire palm, which means you're a natural-born leader with boundless energy and enthusiasm. Your palms show strong qi (life force) flowing through them, indicating a vibrant personality that lights up every room you enter.",
      traits: ["Bold", "spontaneous", "passionate", "energetic", "courageous"]
    },
    earth: {
      overview: "You have an Earth palm, suggesting you're practical, reliable, and grounded. Your strong line structure shows someone who builds lasting foundations and values security above all else.",
      traits: ["Practical", "reliable", "patient", "determined", "sensible"]
    },
    air: {
      overview: "You have an Air palm, revealing an intellectual, analytical mind. Your palm lines show complex thinking patterns and a natural curiosity about the world around you.",
      traits: ["Curious", "analytical", "social", "communicative", "inventive"]
    },
    water: {
      overview: "You have a Water palm, indicating a highly intuitive and emotional nature. Your palm shows deep sensitivity and creative potential, with feelings that run deep like the oceans.",
      traits: ["Intuitive", "creative", "emotional", "adaptable", "artistic"]
    }
  };

  const type = types[palmType];

  const traits = type.traits.sort(() => random() - 0.5).slice(0, 3);

  const lifeLineMeanings = [
    "Your Life Line starts strong and curves gently, suggesting robust health and vitality throughout your life. You have good natural defenses against illness.",
    "The Life Line shows some breaks, indicating you've faced or will face significant transformations. These changes, while challenging, ultimately strengthen your character.",
    "A deep and well-defined Life Line speaks of physical strength and the will to live fully. You likely have plenty of energy to pursue your dreams.",
    "The Life Line wraps closely around the thumb, meaning you're someone who values independence and personal freedom above comfort."
  ];

  const heartLineMeanings = [
    "Your Heart Line starts under the index finger, suggesting you approach love with logic and caution. You're loyal once committed, but take time to open up emotionally.",
    "A Heart Line that reaches all the way to the index finger indicates a passionate nature. You love deeply and aren't afraid to show your emotions.",
    "The Heart Line is straight and shallow, showing you keep emotional distance. You prefer practical displays of affection over dramatic expressions.",
    "Your Heart Line has a fork at the end, suggesting emotional balance - you can balance personal needs with your partner's needs."
  ];

  const headLineMeanings = [
    "Your Head Line is long and well-defined, showing strong analytical abilities. You're a logical thinker who considers all angles before making decisions.",
    "A slightly curved Head Line indicates creative thinking. You don't just see facts - you see possibilities and connections others miss.",
    "The Head Line starts separate from the Life Line, showing independent thinking. You form your own opinions and aren't easily influenced by others.",
    "A forked Head Line suggests versatile thinking - you can approach problems from multiple angles simultaneously."
  ];

  const fateLineMeanings = [
    "A visible Fate Line shows you're someone who shapes their own destiny. You're not just carried by life - you steer your own course.",
    "Your Fate Line is faint or broken, suggesting an adaptable life path. You're flexible and can succeed in various circumstances.",
    "No strong Fate Line means you're free to create your own path without predetermined constraints. This is freedom, not limitation."
  ];

  const mounts = [
    {
      name: "Mount of Venus",
      content: "Well-developed and plump, indicating natural charm and magnetic personality. You attract others with your warmth and generosity.",
      meaning: "This means you're naturally lovable and have an easy time forming relationships. Your presence brings joy to others."
    },
    {
      name: "Mount of Jupiter",
      content: "Prominent and strong, showing natural leadership abilities. You have the ambition and confidence to take charge when needed.",
      meaning: "You're destined for roles where you can lead and inspire others. Success comes naturally to you in positions of authority."
    },
    {
      name: "Mount of Saturn",
      content: "Well-defined, indicating wisdom beyond your years. You have a mature outlook and value responsibility.",
      meaning: "You bring stability to any situation. Others look to you for guidance because you think before acting."
    },
    {
      name: "Mount of Mercury",
      content: "Showing good development, suggesting strong communication skills and business acumen. Your words carry weight.",
      meaning: "You have the gift of persuasion. Careers in communication, sales, or teaching suit you well."
    },
    {
      name: "Upper Mars",
      content: "Strong andwell-defined, showing courage and fighting spirit. You don't back down from challenges.",
      meaning: "You have the bravery to face any obstacle. Others can count on you in difficult times."
    },
    {
      name: "Lower Mars",
      content: "Well-developed, indicating persistence and determination. When you start something, you see it through.",
      meaning: "Your determination is unmatched. Setbacks don't stop you - they make you more determined to succeed."
    },
    {
      name: "Mount of Moon",
      content: "Showing good development, indicating imagination and intuition. You have rich inner worlds and creative potential.",
      meaning: "Your intuition is strong. Trust your gut feelings - they're often right. Creative pursuits could bring you joy."
    }
  ];

  const fingers = [
    {
      name: "Index Finger (Jupiter)",
      content: "Longer than average, showing strong ambition and desire for recognition. You want to achieve and be acknowledged for it.",
      meaning: "You're driven by success and status. Channel this into meaningful goals and you'll go far."
    },
    {
      name: "Middle Finger (Saturn)",
      content: "Well-proportioned, indicating balanced sense of responsibility. You know when to work and when to play.",
      meaning: "You have natural self-discipline. This helps you stay on track toward your long-term goals."
    },
    {
      name: "Ring Finger (Apollo)",
      content: "Prominent, showing appreciation for beauty and creativity. You have artistic tendencies, whether expressed or not.",
      meaning: "Beauty matters to you. Whether through art, style, or environment, you need creative expression in your life."
    },
    {
      name: "Little Finger (Mercury)",
      content: "Well-developed, suggesting strong communication skills. You're articulate and can express yourself clearly.",
      meaning: "Communication is your strength. Use this gift in careers that involve writing, speaking, or teaching."
    },
    {
      name: "Thumb",
      content: "Strong and well-angled, showing good willpower and determination. You know your own mind.",
      meaning: "You have the strength of character to stand by your convictions. Others respect your resolve."
    }
  ];

  const signs = [
    {
      name: "Star Mark",
      content: "A rare star marking present on your palm, indicating potential for distinction in your field. This is a mark of achievement.",
      meaning: "You're capable of extraordinary things. This mark suggests you have the potential to excel in ways others don't."
    },
    {
      name: "Triangle",
      content: "A clear triangle formation in your palm, indicating wisdom and the ability to combine knowledge effectively.",
      meaning: "You have the mental capacity to synthesize information and create solutions. Your mind is your greatest asset."
    },
    {
      name: "Circle (Ring)",
      content: "A ring marking visible, suggesting a self-contained nature. You have inner resources that sustain you.",
      meaning: "You don't need external validation. You have everything you need within yourself to succeed."
    },
    {
      name: "Cross Mark",
      content: "A cross marking present, indicating moments of decision or change. These are opportunities for growth.",
      meaning: "Challenges you face are actually turning points. Each cross marks a moment where you can level up."
    },
    {
      name: "Island",
      content: "An island marking visible, indicating a period of transformation or learning. This represents a journey of self-discovery.",
      meaning: "You're in or approaching a transformative phase. Embrace it - you emerge stronger on the other side."
    }
  ];

  const careerTraits = [
    "Your strong finger definition suggests success in fields that require communication. Teaching, writing, or sales could be fulfilling.",
    "The mounts of your palm indicate natural leadership abilities. Management or entrepreneurial roles play to your strengths.",
    "Your creative mount development suggests an artistic streak. Consider careers that allow creative expression.",
    "Your analytical Head Line points to success in technical or scientific fields where logic is prized.",
    "Your well-developed Mercury mount suggests business acumen. Entrepreneurship or finance could be natural fits."
  ];

  const loveTraits = [
    "Your Heart Line suggests you need a partner who respects your independence. Clinginess is a red flag for you.",
    "The shape of your Mount of Venus indicates you attract partners easily. Your natural charm works in your favor.",
    "Your approach to love is practical but deep. You don't show off, but when you love, you love completely.",
    "You seek a partner who can match your intellectual energy. Conversation and mental connection are important to you.",
    "Your emotional nature means you feel deeply in relationships. Partner with someone who appreciates your depth."
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
      { title: "Fate Line", content: fateLineMeanings[Math.floor(random() * fateLineMeanings.length)], meaning: "Your approach to success" }
    ],
    mounts: mounts.sort(() => random() - 0.5).slice(0, mountCount),
    fingers: fingers.sort(() => random() - 0.5).slice(0, fingerCount),
    signs: signs.sort(() => random() - 0.5).slice(0, signCount),
    career: careerTraits[Math.floor(random() * careerTraits.length)],
    love: loveTraits[Math.floor(random() * loveTraits.length)]
  };
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reading, setReading] = useState<Reading | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const analyzePalm = () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    setTimeout(() => {
      const seed = generateSeedFromImage(new File([], fileName));
      const result = generateReading(seed);
      setReading(result);
      setIsProcessing(false);
      setProgress(100);
    }, 3500);
  };

  const reset = () => {
    setImage(null);
    setFileName("");
    setReading(null);
    setProgress(0);
    setActiveTab("overview");
  };

  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isProcessing && progress === 100 && reading) {
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [isProcessing, progress, reading]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "majorLines", label: "Major Lines" },
    { id: "mounts", label: "Mounts" },
    { id: "fingers", label: "Fingers" },
    { id: "signs", label: "Signs & Marks" },
    { id: "career", label: "Career" },
    { id: "love", label: "Love" }
  ];

  const particles = useMemo(() => 
    [...Array(15)].map((_, i) => ({
      left: `${(i * 7 + 3) % 100}%`,
      animationDelay: `${(i * 0.4)}s`,
      animationDuration: `${5 + (i % 4)}s`,
      width: `${2 + (i % 3)}px`,
      height: `${2 + (i % 3)}px`
    })), []
  );

  return (
    <main className="min-h-screen bg-mystical">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
              width: p.width,
              height: p.height
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a1a2e] to-transparent py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🖐️</span>
            <h1 className="font-decorative text-xl text-highlight">PalmWis</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h1 className="font-decorative text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ textShadow: "0 0 40px rgba(233, 69, 96, 0.3)" }}>
            Discover Your Destiny<br />
            <span className="text-highlight">Written in Your Palm</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-2xl mx-auto font-body">
            Ancient palmistry wisdom made simple. Upload your palm photo and uncover the secrets written in your hand.
          </p>
          <button
            onClick={scrollToUpload}
            className="btn-primary text-lg"
          >
            Read My Palm
          </button>
        </div>

        {/* Decorative palm icon */}
        <div className="mt-16 text-9xl opacity-20 animate-pulse">
          🖐️
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          {!image ? (
            <div
              className={`upload-zone ${dragOver ? 'dragover' : ''} fade-in`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-6xl mb-6">📷</div>
              <h2 className="font-decorative text-2xl mb-4">Drop Your Palm Photo Here</h2>
              <p className="text-text-secondary mb-4">or click to browse</p>
              <p className="text-sm text-text-secondary">Supports: JPEG, PNG, WebP (max 10MB)</p>
            </div>
          ) : (
            <div className="fade-in">
              <div className="card-mystical p-8 glow-subtle">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Image Preview */}
                  <div className="relative flex-shrink-0">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="Uploaded palm"
                        className="max-w-xs mx-auto rounded-xl shadow-2xl"
                        style={{ border: "3px solid rgba(233, 69, 96, 0.3)" }}
                      />
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                          <div className="scan-line" style={{ position: "relative", width: "100%", animation: "scan 2s ease-in-out infinite" }} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-2 text-center">{fileName}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-decorative text-2xl mb-4 text-highlight">
                      {isProcessing ? "Reading Your Palm..." : "Ready to Analyze"}
                    </h3>
                    
                    {isProcessing ? (
                      <div className="mb-4">
                        <div className="w-full bg-[#16213e] rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#e94560] to-[#f5c518] transition-all duration-300 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <p className="text-text-secondary mt-2">Analyzing lines and mounts...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <p className="text-text-secondary">
                          Your palm is ready to be read. Click below to reveal the ancient wisdom written in your hand.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                          <button
                            onClick={analyzePalm}
                            className="btn-primary"
                          >
                            Analyze Palm
                          </button>
                          <button
                            onClick={reset}
                            className="btn-secondary"
                          >
                            Choose Different Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
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

            {/* Palm Type Badge */}
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

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 fade-in delay-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="card-mystical p-8 glow-subtle fade-in delay-3">
              {/* Overview Tab */}
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

              {/* Major Lines Tab */}
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

              {/* Mounts Tab */}
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

              {/* Fingers Tab */}
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

              {/* Signs Tab */}
              {activeTab === "signs" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">Special Signs & Marks</h3>
                  <p className="text-text-secondary mb-6">
                    These unique markings on your palm are considered significant in palmistry, indicating special gifts or life events.
                  </p>
                  {reading.signs.map((sign, idx) => (
                    <div key={idx} className="bg-[#16213e] rounded-xl p-6">
                      <h4 className="font-decorative text-lg mb-3 text-accent">{sign.name}</h4>
                      <p className="text-text-primary mb-3">{sign.content}</p>
                      <div className="border-t border-[#252545] pt-3">
                        <p className="text-sm text-highlight">✨ Meaning:</p>
                        <p className="text-sm text-text-secondary mt-1">{sign.meaning}</p>
                      </div>
                    </div>
                  ))}
                  {reading.signs.length === 0 && (
                    <p className="text-text-secondary text-center py-8">
                      Your palm shows fewer prominent special marks, suggesting a clean, straightforward path in life without major interruptions.
                    </p>
                  )}
                </div>
              )}

              {/* Career Tab */}
              {activeTab === "career" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">Career & Success</h3>
                  <div className="bg-[#16213e] rounded-xl p-8">
                    <p className="text-lg text-text-primary mb-6">{reading.career}</p>
                    <div className="border-t border-[#252545] pt-6">
                      <h4 className="font-decorative text-xl mb-4 text-highlight">Your Career Wisdom</h4>
                      <p className="text-text-secondary leading-relaxed mb-4">
                        Your palm reveals natural talents that, when developed, can lead to fulfilling careers. The mounts and lines work together to show where your strengths lie.
                      </p>
                      <p className="text-text-secondary leading-relaxed">
                        Consider paths that align with your core nature. For Fire types, leadership roles suit you. Earth types thrive in stable, practical work. Air types excel in intellectual fields. Water types shine in creative or helping professions.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-[#e94560]/20 to-[#f5c518]/20 rounded-xl p-6 border border-[#e94560]/30">
                    <p className="text-highlight font-medium">💡 Pro Tip:</p>
                    <p className="text-text-secondary mt-2">
                      Your fingers and mounts together paint the complete picture. Trust your instincts when choosing career paths - your palm has been guiding thousands toward their destiny for millennia.
                    </p>
                  </div>
                </div>
              )}

              {/* Love Tab */}
              {activeTab === "love" && (
                <div className="space-y-6">
                  <h3 className="font-decorative text-2xl mb-6 text-highlight">Love & Relationships</h3>
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
                      No palm is exactly alike - your unique combination of lines, mounts, and marks makes your approach to love entirely your own. Embrace what makes you different.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8 fade-in delay-4">
              <button onClick={reset} className="btn-primary">
                Read Another Palm
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-[#252545]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-6">🖐️</div>
          <p className="text-text-secondary mb-4 text-sm max-w-2xl mx-auto">
            Palmistry is an ancient art practiced for thousands of years across many cultures. 
            This reading is for entertainment purposes only and should not be used as the sole basis 
            for major life decisions.
          </p>
          <p className="text-xs text-text-secondary">
            © PalmWis - Bringing ancient wisdom to the modern world
          </p>
        </div>
      </footer>
    </main>
  );
}