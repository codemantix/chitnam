import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Admin typeface: Plus Jakarta Sans, a light geometric sans in the spirit of
 * the "sunlit architectural" admin style (airy light headlines, tight
 * tracking, tabular figures). Imported only by the admin layouts, so the
 * public website never downloads it.
 */
export const adminFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-admin",
});
