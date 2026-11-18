import { Inter, Poppins } from "next/font/google";
import { withPageLayout } from "@/components/layout/PageLayout/PageLayout";
import "@/styles/globals.css";

// Self-hosted at build time by next/font: no request to Google at runtime,
// and size-adjusted fallbacks prevent layout shift while fonts load.
// Headings. Poppins isn't a variable font, so load only the weights the
// design uses (600 for UI and small headings, 700 for large headings).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  // Every page gets the public header/footer layout unless it defines its own
  // `Page.getLayout` (the admin dashboard will, in Phase 4).
  const getLayout = Component.getLayout || withPageLayout;

  return (
    <>
      {/* Font families are set on :root so tokens in variables.css can reference them. */}
      <style jsx global>{`
        :root {
          --font-poppins: ${poppins.style.fontFamily};
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
