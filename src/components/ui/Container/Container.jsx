import { cn } from "@/utils/cn";
import styles from "./Container.module.css";

const SIZES = {
  default: styles.default,
  narrow: styles.narrow,
  wide: styles.wide,
};

/**
 * Horizontal page wrapper: max width + responsive side gutter.
 *
 * @param {object} props
 * @param {"default"|"narrow"|"wide"} [props.size="default"]
 * @param {keyof JSX.IntrinsicElements} [props.as="div"]
 */
export default function Container({
  as: Tag = "div",
  size = "default",
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={cn(styles.container, SIZES[size], "mx-auto w-full", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
