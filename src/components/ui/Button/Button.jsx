import Link from "next/link";
import { cn } from "@/utils/cn";
import styles from "./Button.module.css";

const VARIANTS = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  inverse: styles.inverse,
  inverseOutline: styles.inverseOutline,
};

const SIZES = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-13 px-7 text-base",
};

const isExternal = (href) => /^(https?:|mailto:|tel:)/i.test(href);

function Arrow() {
  return (
    <svg
      className={styles.arrow}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Renders a Next.js <Link> for internal hrefs, an <a> for external ones,
 * and a <button> when no href is given.
 *
 * @param {object} props
 * @param {"primary"|"secondary"|"ghost"|"inverse"|"inverseOutline"} [props.variant="primary"]
 * @param {"md"|"lg"} [props.size="md"]
 * @param {string} [props.href]
 * @param {boolean} [props.withArrow] Shows an arrow that nudges on hover.
 * @param {boolean} [props.loading] Disables the button and announces busy state.
 */
export default function Button({
  variant = "primary",
  size = "md",
  href,
  withArrow = false,
  loading = false,
  className,
  children,
  type = "button",
  disabled,
  ...rest
}) {
  const classes = cn(
    styles.button,
    VARIANTS[variant],
    "inline-flex items-center justify-center gap-2 font-medium",
    SIZES[size],
    className
  );

  const content = (
    <>
      <span>{children}</span>
      {withArrow && <Arrow />}
    </>
  );

  if (href) {
    if (isExternal(href)) {
      const opensNewTab = /^https?:/i.test(href);
      return (
        <a
          href={href}
          className={classes}
          {...(opensNewTab && { target: "_blank", rel: "noopener noreferrer" })}
          {...rest}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {content}
    </button>
  );
}
