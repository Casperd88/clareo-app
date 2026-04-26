import { useCallback, useEffect, useRef, useState } from "react";
import books from "../assets/hero/books.png";
import leafs from "../assets/hero/leafs.png";
import lamp from "../assets/hero/lamp.png";
import reader from "../assets/hero/reader.png";
import stairs from "../assets/hero/stairs.png";
import styles from "./HeroCollage.module.css";

const HERO_IMAGES = [books, leafs, lamp, reader, stairs];

if (typeof window !== "undefined") {
  HERO_IMAGES.forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [query]);
  return matches;
}

function useImagesReady(srcs) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const decoded = Promise.all(
      srcs.map((src) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        if (typeof img.decode !== "function") return Promise.resolve();
        return img.decode().catch(() => {});
      })
    );
    const fallback = new Promise((resolve) => setTimeout(resolve, 250));
    Promise.race([decoded, fallback]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

/**
 * Replaces the previous `useScroll` + spring stack: one rAF-batched
 * `scroll/resize` listener that writes a handful of custom properties
 * on the root so every parallax + fade is a single composited
 * `translate3d` / `opacity` read — no per-element JS animation loop.
 */
function useParallaxScroll(rootRef, enabled) {
  const update = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!enabled) {
      el.style.setProperty("--y-slow", "0px");
      el.style.setProperty("--y-med", "0px");
      el.style.setProperty("--y-fast", "0px");
      el.style.setProperty("--y-rev", "0px");
      el.style.setProperty("--fade", "1");
      return;
    }
    const rect = el.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const h = el.offsetHeight || 1;
    const p = Math.min(1, Math.max(0, (window.scrollY - elementTop) / h));
    const fade = p <= 0.8 ? 1 : 1 - (p - 0.8) / 0.2;
    el.style.setProperty("--y-slow", `${-60 * p}px`);
    el.style.setProperty("--y-med", `${-140 * p}px`);
    el.style.setProperty("--y-fast", `${-220 * p}px`);
    el.style.setProperty("--y-rev", `${80 * p}px`);
    el.style.setProperty("--fade", String(fade));
  }, [enabled, rootRef]);

  useEffect(() => {
    let ticking = false;
    const onFrame = () => {
      ticking = false;
      update();
    };
    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onFrame);
    };
    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [update]);
}

export default function HeroCollage() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isCompact = useMediaQuery("(max-width: 1100px)");
  const isCoarse = useMediaQuery("(pointer: coarse)");
  const lite = isCompact || isCoarse;
  const ready = useImagesReady(HERO_IMAGES);
  const parallaxOn = !lite && !reduced;

  const ref = useRef(null);
  useParallaxScroll(ref, parallaxOn);

  const rootClass = [
    styles.collage,
    ready && styles.ready,
    reduced && styles.reduced,
    lite && styles.lite,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={rootClass} aria-hidden="true">
      <div className={styles.auroraTame} aria-hidden="true" />
      <div
        className={styles.lamp}
      >
        <div className={styles.lampEnter}>
          <div className={styles.beam} aria-hidden="true">
            <div className={styles.beamFlicker} />
          </div>
          <div className={styles.floorPool} aria-hidden="true" />
          <div className={styles.lampInner}>
            <img
              src={lamp}
              alt=""
              draggable="false"
              decoding="async"
              loading="eager"
            />
            <div className={styles.shadeGlow} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={`${styles.layer} ${styles.left} ${styles.layerFade}`}>
        <div
          className={`${styles.pinkCircle} ${styles.parallaxLayer} ${styles.parallaxSlow}`}
        >
          <div
            className={styles.pinkCircleGrow}
            style={{ "--d": "0.1s" }}
          >
            <svg
              className={styles.pinkCircleInner}
              viewBox="0 0 400 400"
            >
              <circle cx="200" cy="200" r="200" fill="#FF4C8C" />
            </svg>
          </div>
        </div>

        <div
          className={`${styles.mintSmall} ${styles.parallaxLayer} ${styles.parallaxFast}`}
        >
          <svg
            className={styles.mintEntrance}
            viewBox="0 0 80 80"
            style={{ "--d": "0.45s" } }
          >
            <circle cx="40" cy="40" r="40" fill="#66D9B3" />
          </svg>
        </div>

        <div
          className={`${styles.violetDot} ${styles.parallaxLayer} ${styles.parallaxMed}`}
        >
          <svg
            className={styles.violetEntrance}
            viewBox="0 0 40 40"
            style={{ "--d": "0.6s" } }
          >
            <circle cx="20" cy="20" r="20" fill="#B84CFA" />
          </svg>
        </div>

        <div
          className={`${styles.reader} ${styles.parallaxLayer} ${styles.parallaxSlow}`}
        >
          <img
            src={reader}
            alt=""
            draggable="false"
            decoding="async"
            loading="eager"
            className={styles.fillImg}
            style={{ "--d": "0.55s" } }
          />
        </div>

        <div
          className={`${styles.books} ${styles.parallaxLayer} ${styles.parallaxMed}`}
        >
          <img
            src={books}
            alt=""
            draggable="false"
            decoding="async"
            loading="eager"
            className={styles.fillImg}
            style={{ "--d": "0.75s" } }
          />
        </div>
      </div>

      <div className={`${styles.layer} ${styles.right} ${styles.layerFade}`}>
        <div
          className={`${styles.indigoCircle} ${styles.parallaxLayer} ${styles.parallaxSlow}`}
        >
          <div
            className={styles.indigoCircleGrow}
            style={{ "--d": "0.15s" } }
          >
            <svg
              className={styles.indigoCircleInner}
              viewBox="0 0 440 440"
            >
              <circle cx="220" cy="220" r="220" fill="#7373FF" />
            </svg>
          </div>
        </div>

        <div
          className={`${styles.peachBlock} ${styles.parallaxLayer} ${styles.parallaxFast}`}
        >
          <svg
            className={styles.fillSvg}
            viewBox="0 0 160 200"
            preserveAspectRatio="none"
            style={{ "--d": "0.5s" } }
          >
            <rect x="0" y="0" width="160" height="200" rx="6" fill="#FFB366" />
          </svg>
        </div>

        <div
          className={`${styles.stairs} ${styles.parallaxLayer} ${styles.parallaxMed}`}
        >
          <div
            className={styles.stairsInner}
            style={{ "--d": "0.4s" } }
          >
            <img
              src={stairs}
              alt=""
              draggable="false"
              decoding="async"
              loading="eager"
            />
          </div>
        </div>

        <div
          className={`${styles.dotGrid} ${styles.parallaxLayer} ${styles.parallaxRev}`}
        >
          <svg
            viewBox="0 0 80 80"
            className={styles.dotGridEntrance}
            style={{ "--d": "0.75s" } }
          >
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((_, c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={6 + c * 14}
                  cy={6 + r * 14}
                  r="2"
                  fill="#1A1D24"
                />
              ))
            )}
          </svg>
        </div>

        <div
          className={`${styles.leafs} ${styles.parallaxLayer} ${styles.parallaxFast}`}
        >
          <div
            className={styles.leafsEnter}
            style={{ "--d": "1s" } }
          >
            <div className={styles.leafsInner}>
              <img
                src={leafs}
                alt=""
                draggable="false"
                decoding="async"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
