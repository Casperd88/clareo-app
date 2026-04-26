import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AuroraBackground from "./AuroraBackground";
import styles from "./AuroraHomeRoute.module.css";

const FADE_MS = 500;

/**
 * Renders the WebGL aurora only on `/`. Fades the layer in and out on
 * client-side route changes. Unmounts the canvas after the exit fade so
 * other pages do not pay for the shader.
 */
export default function AuroraHomeRoute() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [inDom, setInDom] = useState(isHome);
  const [fadedIn, setFadedIn] = useState(false);

  useEffect(() => {
    if (isHome) {
      setInDom(true);
      // Double rAF: first paint is opacity 0, then transition to 0.8.
      const r = requestAnimationFrame(() => {
        requestAnimationFrame(() => setFadedIn(true));
      });
      return () => cancelAnimationFrame(r);
    }

    setFadedIn(false);
    const t = window.setTimeout(() => {
      setInDom(false);
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [isHome]);

  if (!inDom) return null;

  return (
    <div
      className={styles.shell}
      data-visible={fadedIn ? "true" : "false"}
      aria-hidden="true"
    >
      <AuroraBackground />
    </div>
  );
}
