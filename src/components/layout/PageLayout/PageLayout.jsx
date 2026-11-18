import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import styles from "./PageLayout.module.css";

/**
 * Shared shell for public pages: skip link, header, <main>, footer.
 * Pages render their content only; this provides the single <main> landmark.
 * Applied to every page by default in _app.js.
 */
export default function PageLayout({ children }) {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}

/** Convenience for `Page.getLayout = withPageLayout`. */
export const withPageLayout = (page) => <PageLayout>{page}</PageLayout>;
