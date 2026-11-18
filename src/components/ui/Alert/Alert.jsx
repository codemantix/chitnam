import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import styles from "./Alert.module.css";

const TONES = {
  error: styles.error,
  success: styles.success,
  info: styles.info,
  warning: styles.warning,
};

/**
 * Status message. Errors use role="alert" (announced immediately);
 * other tones use role="status" (announced politely).
 *
 * @param {object} props
 * @param {"error"|"success"|"info"|"warning"} [props.tone="info"]
 * @param {string} [props.title]
 */
const Alert = forwardRef(function Alert({ tone = "info", title, children, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      role={tone === "error" ? "alert" : "status"}
      className={cn(styles.alert, TONES[tone], "flex flex-col gap-1 p-4", className)}
      {...rest}
    >
      {title && <p className="font-medium">{title}</p>}
      {children && <div className="text-sm">{children}</div>}
    </div>
  );
});

export default Alert;
