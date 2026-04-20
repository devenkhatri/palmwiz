"use client";

const testimonials = [
  { name: "Sarah M.", avatar: "👩", quote: "Shocking accuracy! The career insight was spot on.", rating: 5 },
  { name: "James K.", avatar: "👨", quote: "Changed my life. The love reading helped me understand my relationship patterns.", rating: 5 },
  { name: "Priya S.", avatar: "👩‍💼", quote: "My best friend recommended this and now I recommend it to everyone!", rating: 5 },
  { name: "Mike R.", avatar: "🧔", quote: "Skeptical at first but the accuracy freaked me out. Still thinking about it.", rating: 5 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(rating)].map((_, i) => (
        <span key={i} className="text-highlight text-sm">★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-decorative text-2xl md:text-3xl text-center mb-4">
          What People Say About <span className="text-highlight">PalmWis</span>
        </h2>
        <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
          Thousands of readings delivered. Here&apos;s what our community has to say.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {testimonials.map(({ name, avatar, quote, rating }) => (
            <div key={name} className="card-mystical p-5 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{name}</p>
                  <StarRating rating={rating} />
                </div>
              </div>
              <p className="text-text-secondary text-sm italic">&ldquo;{quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}