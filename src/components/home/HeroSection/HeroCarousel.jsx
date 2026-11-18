import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import Icon from "@/components/ui/Icon/Icon";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/utils/cn";
import styles from "./HeroCarousel.module.css";

const SWIPE_THRESHOLD = 48;

/**
 * Full-width photo slider for the homepage hero, in the style of the
 * original site: a photo per slide behind a dark overlay, centred white
 * headline and calls to action, arrows on the sides.
 *
 * Accessibility (WAI-ARIA tabbed carousel pattern):
 * - Topic labels at the bottom are tabs (arrow keys, Home/End).
 * - Prev/next arrow buttons; swipe on touch screens.
 * - Autoplay has a pause button, pauses on hover/focus and never runs for
 *   users who prefer reduced motion (WCAG 2.2.2).
 * - Inactive slides are `inert`; inactive photos are aria-hidden.
 *
 * Performance:
 * - Slide 1's photo loads eagerly with high priority (the LCP image).
 * - The other photos are in the HTML (crawlable alt text) but display:none
 *   until the page has loaded, so they never compete with the first paint.
 *
 * @param {object} props
 * @param {object[]} props.slides See data/home.js → heroSlides.
 * @param {number} [props.autoplayMs=0] Milliseconds per slide; 0 disables autoplay.
 * @param {React.ReactNode} [props.heading] Rendered above the headline (the page h1).
 * @param {React.ReactNode} [props.footer] Rendered under the buttons.
 */
export default function HeroCarousel({ slides, autoplayMs = 0, heading, footer }) {
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const tabRefs = useRef([]);
  const swipeStartX = useRef(null);
  const baseId = useId();
  const count = slides.length;

  const goTo = useCallback(
    (index, { focusTab = false } = {}) => {
      const next = (index + count) % count;
      setActive(next);
      if (focusTab) tabRefs.current[next]?.focus();
    },
    [count]
  );

  // Load the other slides' photos once the page itself has loaded.
  useEffect(() => {
    const ready = () => setMediaReady(true);
    if (document.readyState === "complete") {
      const timer = setTimeout(ready, 300);
      return () => clearTimeout(timer);
    }
    window.addEventListener("load", ready, { once: true });
    return () => window.removeEventListener("load", ready);
  }, []);

  const autoplayEnabled = autoplayMs > 0 && !reducedMotion && count > 1;
  const playing = autoplayEnabled && !userPaused && !interacting;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => goTo(active + 1), autoplayMs);
    return () => clearTimeout(timer);
  }, [playing, active, autoplayMs, goTo]);

  // Keep the active topic visible in the (horizontally scrollable) tab strip
  // on small screens. Scrolls only the strip, never the page.
  useEffect(() => {
    const tab = tabRefs.current[active];
    const list = tab?.parentElement;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: Math.max(0, tab.offsetLeft - 16), behavior: reducedMotion ? "auto" : "smooth" });
  }, [active, reducedMotion]);

  const onTabKeyDown = (event) => {
    const keys = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: count - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key], { focusTab: true });
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse") return;
    swipeStartX.current = event.clientX;
  };
  const onPointerUp = (event) => {
    if (swipeStartX.current === null) return;
    const deltaX = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    goTo(deltaX < 0 ? active + 1 : active - 1);
  };

  const tabId = (i) => `${baseId}-tab-${i}`;
  const panelId = (i) => `${baseId}-panel-${i}`;

  return (
    <div
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="How we can help"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{ "--autoplay-ms": `${autoplayMs}ms` }}
    >
      {/* ----- Background photos ----- */}
      <div className={styles.media}>
        {slides.map((slide, i) => {
          const isActive = i === active;
          const isFirst = i === 0;
          const deferred = !isActive && !mediaReady;
          return (
            <div key={slide.image.src} className={cn(styles.photo, isActive && styles.photoActive, deferred && styles.photoDeferred)} aria-hidden={!isActive}>
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                sizes="100vw"
                loading={isFirst ? "eager" : "lazy"}
                fetchPriority={isFirst ? "high" : "low"}
                quality={55}
                className={styles.img}
                style={{ objectPosition: slide.image.position || "50% 50%" }}
              />
            </div>
          );
        })}
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      {/* ----- Arrows ----- */}
      <button type="button" className={cn(styles.arrow, styles.arrowPrev)} onClick={() => goTo(active - 1)}>
        <Icon name="arrowLeft" size={22} />
        <span className="sr-only">Previous slide</span>
      </button>
      <button type="button" className={cn(styles.arrow, styles.arrowNext)} onClick={() => goTo(active + 1)}>
        <Icon name="arrowRight" size={22} />
        <span className="sr-only">Next slide</span>
      </button>

      {/* ----- Copy ----- */}
      <Container className={cn(styles.content, "relative flex flex-col items-center text-center")}>
        {heading}
        <div className={styles.viewport}>
          {slides.map((slide, i) => {
            const isActive = i === active;
            return (
              <div
                key={slide.label}
                id={panelId(i)}
                role="tabpanel"
                aria-roledescription="slide"
                aria-labelledby={tabId(i)}
                inert={!isActive}
                className={cn(styles.slide, isActive && styles.slideActive, "flex flex-col items-center gap-5")}
              >
                <h2 className={styles.headline}>{slide.headline}</h2>
                <p className={styles.text}>{slide.text}</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button href={slide.primary.href} size="lg" withArrow>
                    {slide.primary.label}
                  </Button>
                  {slide.secondary && (
                    <Button href={slide.secondary.href} size="lg" variant="inverseOutline">
                      {slide.secondary.label}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {footer}
      </Container>

      {/* ----- Topic tabs + pause ----- */}
      <div className={styles.controls}>
        <Container className="flex items-center justify-center gap-3">
          <div role="tablist" aria-label="Choose a topic" className={cn(styles.tablist, "min-w-0 overflow-x-auto")} onKeyDown={onTabKeyDown}>
            {slides.map((slide, i) => (
              <button
                key={slide.label}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={tabId(i)}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls={panelId(i)}
                tabIndex={i === active ? 0 : -1}
                onClick={() => goTo(i)}
                className={cn(styles.tab, i === active && styles.tabActive, playing && i === active && styles.tabTiming)}
              >
                {slide.label}
              </button>
            ))}
          </div>
          {autoplayEnabled && (
            <button type="button" className={styles.pause} onClick={() => setUserPaused((paused) => !paused)} aria-label={userPaused ? "Play slides" : "Pause slides"}>
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
                {userPaused ? <path d="M3 1.5v11l9-5.5z" /> : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" />}
              </svg>
            </button>
          )}
        </Container>
      </div>

      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        Slide {active + 1} of {count}: {slides[active].label}
      </p>
    </div>
  );
}
