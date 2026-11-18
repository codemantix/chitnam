import { Head, Html, Main, NextScript } from "next/document";
import { siteConfig } from "@/config/site";

// Custom document only to set the language and theme colour for the whole site.
export default function Document() {
  return (
    // data-scroll-behavior lets Next.js disable smooth scrolling during route
    // transitions, so new pages start at the top instantly.
    <Html lang="en-NG" data-scroll-behavior="smooth">
      <Head>
        <meta name="theme-color" content="#ffffff" />
        {/* Interim icons cropped from the raster logo; replace when the SVG original is supplied. */}
        <link rel="icon" href="/icon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Search Console ownership check, only on the live site. */}
        {siteConfig.indexable && siteConfig.analytics.googleSiteVerification && (
          <meta name="google-site-verification" content={siteConfig.analytics.googleSiteVerification} />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
