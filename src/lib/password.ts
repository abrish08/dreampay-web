// Password rules for sign-up and password changes. The API accepts 12 to 128
// characters; the form also asks for a mix of character types.
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

export type PasswordRule = { id: string; label: string; ok: boolean };
export type PasswordCheck = {
  rules: PasswordRule[]; // required: all must pass
  advice: string[]; // not required, but they lower the strength
  valid: boolean;
  percent: number;
  label: "Too weak" | "Weak" | "Fair" | "Good" | "Strong";
  tone: "danger" | "warning" | "info" | "success";
};

// Passwords and words attackers try first (checked as parts of the password too).
const COMMON = ["password", "passw0rd", "qwerty", "123456", "123123", "111111", "abc123", "letmein", "welcome", "admin", "login", "iloveyou",
  "monkey", "dragon", "football", "sunshine", "master", "secret", "paygate", "ethiopia", "addis", "abeba", "selam", "habesha", "telebirr"];

const SEQUENCES = ["abcdefghijklmnopqrstuvwxyz", "qwertyuiopasdfghjklzxcvbnm", "01234567890"];

/** Parts of the user's own details that should not appear in the password. */
export function personalWords(...values: (string | undefined)[]): string[] {
  return values.flatMap((v) => (v ?? "").toLowerCase().split(/[^\p{L}\p{N}]+/u)).filter((w) => w.length >= 3);
}

function hasSequence(pw: string): boolean {
  const s = pw.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i + 4 <= seq.length; i++) {
      const part = seq.slice(i, i + 4);
      if (s.includes(part) || s.includes([...part].reverse().join(""))) return true;
    }
  }
  return false;
}

export function checkPassword(pw: string, personal: string[] = []): PasswordCheck {
  const lower = pw.toLowerCase();
  const common = COMMON.some((w) => lower.includes(w));
  const mine = personal.some((w) => lower.includes(w));
  const rules: PasswordRule[] = [
    { id: "length", label: `At least ${PASSWORD_MIN} characters`, ok: pw.length >= PASSWORD_MIN && pw.length <= PASSWORD_MAX },
    { id: "lower", label: "A lowercase letter (a–z)", ok: /\p{Ll}/u.test(pw) },
    { id: "upper", label: "An uppercase letter (A–Z)", ok: /\p{Lu}/u.test(pw) },
    { id: "number", label: "A number (0–9)", ok: /\d/.test(pw) },
    { id: "symbol", label: "A symbol, e.g. ! @ # $ % & *", ok: /[^\p{L}\p{N}\s]/u.test(pw) },
  ];
  const valid = rules.every((r) => r.ok);
  const advice: string[] = [];
  if (pw && mine) advice.push("It contains your name, business or email, which makes it easier to guess.");
  if (pw && common) advice.push("It contains a common word attackers try first.");
  if (pw && (hasSequence(pw) || /(.)\1\1/.test(pw))) advice.push("It contains a sequence or repeated characters (abcd, 1234, aaa).");

  // Strength: estimated entropy (length × variety of characters), minus patterns.
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(Math.max(pool, 1));
  if (/(.)\1\1/.test(pw)) bits -= 12;
  if (hasSequence(pw)) bits -= 12;
  let percent = Math.round(Math.min(100, Math.max(0, (bits / 90) * 100)));
  if (common || mine) percent = Math.min(percent, 50); // allowed, but never more than "Fair"
  if (!valid) percent = Math.min(percent, 55); // never "Good" before every rule passes
  if (!pw) percent = 0;

  const label = percent < 20 ? "Too weak" : percent < 40 ? "Weak" : percent < 60 ? "Fair" : percent < 80 ? "Good" : "Strong";
  const tone = percent < 40 ? "danger" : percent < 60 ? "warning" : percent < 80 ? "info" : "success";
  return { rules, advice, valid, percent, label, tone };
}

/** A random 18-character password with every character type (Web Crypto). */
export function suggestPassword(): string {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%^&*-_=+?"];
  const all = sets.join("");
  const pick = (chars: string) => {
    const limit = 256 - (256 % chars.length); // no modulo bias
    for (;;) { const [b] = crypto.getRandomValues(new Uint8Array(1)); if (b < limit) return chars[b % chars.length]; }
  };
  const out = [...sets.map(pick), ...Array.from({ length: 14 }, () => pick(all))];
  for (let i = out.length - 1; i > 0; i--) { // Fisher–Yates with secure randomness
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  const s = out.join("");
  return checkPassword(s).valid ? s : suggestPassword();
}
