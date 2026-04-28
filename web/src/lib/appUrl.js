/**
 * Base URL of the Clareo web app (Expo web build), without trailing slash.
 * Set VITE_CLAREO_APP_URL in .env for production (e.g. https://app.clareo.com).
 * Default matches local `expo start --web` (port 8081).
 */
const DEFAULT_DEV_APP_ORIGIN = "https://app-local.tryclareo.com";

export function getClareoAppGetStartedUrl() {
  const raw = import.meta.env.VITE_CLAREO_APP_URL || DEFAULT_DEV_APP_ORIGIN;
  const base = String(raw).replace(/\/$/, "");
  // Hash fallback: some hosts strip or rewrite query strings on first load
  return `${base}/?signup=1#signup=1`;
}
