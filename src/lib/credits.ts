// ─────────────────────────────────────────────────────────────
// Credit system — localStorage-backed with Supabase sync
// ─────────────────────────────────────────────────────────────

const CREDITS_KEY  = "palmwiz_credits";
const EMAIL_KEY    = "palmwiz_email";
const UNLOCKED_KEY = "palmwiz_unlocked";

export const FREE_CREDITS_ANONYMOUS = 1;
export const FREE_CREDITS_EMAIL     = 3;

export interface CreditState {
  credits: number;
  email: string | null;
  unlocked: boolean; // tabs 2-7 unlocked after email
}

export function loadCredits(): CreditState {
  if (typeof window === "undefined") {
    return { credits: FREE_CREDITS_ANONYMOUS, email: null, unlocked: false };
  }
  try {
    const email    = localStorage.getItem(EMAIL_KEY);
    const raw      = localStorage.getItem(CREDITS_KEY);
    const unlocked = localStorage.getItem(UNLOCKED_KEY) === "true";
    const credits  = raw !== null ? parseInt(raw, 10) : email ? FREE_CREDITS_EMAIL : FREE_CREDITS_ANONYMOUS;
    return { credits, email, unlocked };
  } catch {
    return { credits: FREE_CREDITS_ANONYMOUS, email: null, unlocked: false };
  }
}

export function saveCredits(state: CreditState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CREDITS_KEY, String(state.credits));
    if (state.email) localStorage.setItem(EMAIL_KEY, state.email);
    localStorage.setItem(UNLOCKED_KEY, String(state.unlocked));
  } catch { /* quota */ }
}

export function consumeCredit(state: CreditState): CreditState {
  const next = { ...state, credits: Math.max(0, state.credits - 1) };
  saveCredits(next);
  return next;
}

export function addCredits(state: CreditState, amount: number): CreditState {
  const next = { ...state, credits: state.credits + amount };
  saveCredits(next);
  return next;
}

export function unlockWithEmail(state: CreditState, email: string): CreditState {
  const current = state.email === email ? state.credits : FREE_CREDITS_EMAIL;
  const next: CreditState = {
    credits: Math.max(state.credits, current),
    email,
    unlocked: true,
  };
  saveCredits(next);
  return next;
}
