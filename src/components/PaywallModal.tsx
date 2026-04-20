"use client";

import { useState } from "react";

interface Props {
  email: string | null;
  credits: number;
  onSuccess: (credits: number) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: { email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

type Plan = "credits" | "monthly";

const PLANS = {
  credits: {
    label: "10 Reading Credits",
    price: "₹199",
    subtext: "~₹20 per reading",
    credits: 10,
    icon: "💳",
  },
  monthly: {
    label: "Monthly Unlimited",
    price: "₹499",
    subtext: "Unlimited readings / month",
    credits: 999,
    icon: "♾️",
  },
} as const;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Script load failed"));
    document.head.appendChild(s);
  });
}

export default function PaywallModal({ email, credits, onSuccess, onClose }: Props) {
  const [selected, setSelected] = useState<Plan>("credits");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: selected, email }),
      });

      const order = await orderRes.json();

      if (!orderRes.ok || order.error) {
        // Razorpay not configured — show fallback
        if (orderRes.status === 503) {
          setError("Payment gateway not configured. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET to your environment.");
        } else {
          setError(order.error || "Failed to create order");
        }
        setLoading(false);
        return;
      }

      // 2. Load Razorpay checkout script
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      // 3. Open checkout
      const plan = PLANS[selected];
      const rzp = new window.Razorpay({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        "PalmWis",
        description: order.description,
        order_id:    order.orderId,
        prefill:     { email: email ?? "" },
        theme:       { color: "#e94560" },
        modal:       { ondismiss: () => setLoading(false) },
        handler: async (response) => {
          // 4. Verify server-side
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, email, credits: plan.credits }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            onSuccess(plan.credits);
          } else {
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setError("");

    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();

      if (data.valid && data.credits > 0) {
        setCouponSuccess(true);
        onSuccess(data.credits);
      } else {
        setError("Invalid coupon code");
      }
    } catch {
      setError("Failed to validate coupon");
    }
    setCouponLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm no-print"
      onClick={onClose}
    >
      <div
        className="card-mystical max-w-md w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0f3460] to-[#1a1a2e] p-8 text-center border-b border-[#e94560]/20">
          <div className="text-5xl mb-3">🔮</div>
          <h2 className="font-decorative text-2xl text-highlight mb-2">Continue Your Journey</h2>
          <p className="text-text-secondary text-sm">
            You&apos;ve used your free readings. Choose a plan to continue.
          </p>
          {credits > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#f5c518]/40 bg-[#f5c518]/10 text-[#f5c518]">
              🔮 {credits} credit{credits !== 1 ? "s" : ""} remaining
            </div>
          )}
        </div>

        <div className="p-8 space-y-4">
          {/* Plan selector */}
          {(Object.keys(PLANS) as Plan[]).map(plan => (
            <button
              key={plan}
              onClick={() => setSelected(plan)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4
                ${selected === plan
                  ? "border-[#e94560] bg-[#e94560]/10"
                  : "border-[#252545] bg-[#16213e] hover:border-[#e94560]/50"
                }`}
            >
              <span className="text-2xl">{PLANS[plan].icon}</span>
              <div className="flex-1">
                <p className="font-decorative text-sm text-text-primary">{PLANS[plan].label}</p>
                <p className="text-xs text-text-secondary">{PLANS[plan].subtext}</p>
              </div>
              <span className="font-decorative text-highlight text-lg">{PLANS[plan].price}</span>
            </button>
          ))}

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Coupon input */}
          <div className="border-t border-[#252545] pt-4">
            <p className="text-xs text-text-secondary text-center mb-2">Have a coupon code?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value); setCouponSuccess(false); }}
                placeholder="Enter coupon code"
                className="flex-1 bg-[#16213e] border border-[#252545] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-[#e94560] focus:outline-none"
                disabled={couponLoading}
              />
              <button
                onClick={handleCoupon}
                disabled={couponLoading}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-60"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Processing..." : `Pay ${PLANS[selected].price} via Razorpay`}
          </button>

          <p className="text-center text-xs text-text-secondary">
            Secured by Razorpay · No auto-renewal for credits pack
          </p>

          <button
            onClick={onClose}
            className="w-full text-xs text-text-secondary/60 hover:text-text-secondary transition-colors py-1"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
