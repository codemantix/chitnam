import { useId, useState } from "react";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import styles from "./PasswordFields.module.css";

const COMMON = ["password", "123456", "qwerty", "chitnam", "penguin", "letmein", "welcome", "admin"];

const RULES = [
  { id: "length", label: "At least 10 characters", test: (p) => p.length >= 10 },
  { id: "mix", label: "Letters and numbers", test: (p) => /[a-z]/i.test(p) && /\d/.test(p) },
  { id: "common", label: "Not a common word or your email", test: (p, email) => p.length > 0 && !COMMON.some((w) => p.toLowerCase().includes(w)) && !(email && p.toLowerCase().includes(email.split("@")[0].toLowerCase())) },
];

/** Returns a message if the password isn't acceptable, otherwise "". */
export function passwordProblem(password, email = "") {
  const failed = RULES.find((rule) => !rule.test(password, email));
  if (!failed) return "";
  return {
    length: "Use at least 10 characters for your password.",
    mix: "Use both letters and numbers in your password.",
    common: "Avoid common words and your email address in your password.",
  }[failed.id];
}

function strength(password, email) {
  if (!password) return 0;
  let score = RULES.filter((r) => r.test(password, email)).length; // 0–3
  if (password.length >= 14) score += 1;
  if (/[^a-z0-9]/i.test(password) && /[A-Z]/.test(password)) score += 1;
  return Math.min(score, 5);
}

const LEVELS = ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"];

/**
 * New password + confirmation with a strength meter and live checklist.
 * Used on the set-password page and in Settings → Security.
 */
export default function PasswordFields({ password, confirm, onPassword, onConfirm, email, label = "New password" }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const score = strength(password, email);
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-pw`} className="text-sm font-medium text-ink-900">
          {label} <span className="text-error-700" aria-hidden="true">*</span>
        </label>
        <div className={styles.inputWrap}>
          <input
            id={`${id}-pw`}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            aria-describedby={`${id}-rules`}
            className={styles.input}
            required
          />
          <button type="button" className={styles.reveal} onClick={() => setVisible((v) => !v)} aria-pressed={visible}>
            <Icon name="eye" size={18} />
            <span className="sr-only">{visible ? "Hide password" : "Show password"}</span>
          </button>
        </div>
        <div className={styles.meter} aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={cn(styles.bar, n <= score && styles[`level${score}`])} />
          ))}
        </div>
        <div className="flex items-start justify-between gap-3">
          <ul id={`${id}-rules`} className={styles.rules}>
            {RULES.map((rule) => {
              const ok = rule.test(password, email);
              return (
                <li key={rule.id} className={cn(styles.rule, ok && styles.ruleOk)}>
                  <Icon name={ok ? "check" : "close"} size={14} />
                  {rule.label}
                  <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
                </li>
              );
            })}
          </ul>
          {score > 0 && (
            <span className={cn(styles.levelText, styles[`text${score}`])} aria-live="polite">
              {LEVELS[score]}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-confirm`} className="text-sm font-medium text-ink-900">
          Confirm new password <span className="text-error-700" aria-hidden="true">*</span>
        </label>
        <input
          id={`${id}-confirm`}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => onConfirm(e.target.value)}
          aria-invalid={mismatch || undefined}
          aria-describedby={mismatch ? `${id}-mismatch` : undefined}
          className={cn(styles.input, styles.inputPlain, mismatch && styles.invalid)}
          required
        />
        {mismatch && (
          <p id={`${id}-mismatch`} className="text-sm text-error-700">
            The passwords don&rsquo;t match yet.
          </p>
        )}
      </div>
    </div>
  );
}
