import { cn } from "@/utils/cn";
import styles from "./Prose.module.css";

/**
 * Typographic styles for long-form content (legal pages, articles, guides).
 * Styles plain child elements: h2, h3, p, ul, ol, a, strong, blockquote, img.
 *
 * Pass `html` to render trusted, pre-sanitised HTML (from lib/sanitizeHtml.js)
 * directly inside the wrapper, so the spacing rules apply to its elements.
 */
export default function Prose({ as: Tag = "div", html, className, children }) {
  if (html !== undefined) {
    return <Tag className={cn(styles.prose, className)} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <Tag className={cn(styles.prose, className)}>{children}</Tag>;
}
