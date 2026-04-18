import posthog from 'posthog-js';

export const CONSENT_STORAGE_KEY = 'clareo-analytics-consent';

/** @returns {'minimal' | 'analytics' | null} */
export function getStoredConsent() {
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (v === 'minimal' || v === 'analytics') return v;
    return null;
  } catch {
    return null;
  }
}

export function hasAnalyticsKey() {
  return Boolean(import.meta.env.VITE_PUBLIC_POSTHOG_KEY);
}

let initialized = false;

export function initAnalytics() {
  if (initialized || !hasAnalyticsKey()) return;

  const consent = getStoredConsent();
  const full = consent === 'analytics';

  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    persistence: full ? 'localStorage+cookie' : 'memory',
    disable_session_recording: !full,
    capture_pageview: 'history_change',
    capture_pageleave: full ? 'if_capture_pageview' : false,
    person_profiles: 'identified_only',
  });

  posthog.register({
    analytics_consent: consent ?? 'pending',
  });

  if (full) {
    posthog.startSessionRecording();
  }

  initialized = true;
}

/**
 * @param {'minimal' | 'analytics'} mode
 */
export function applyAnalyticsConsent(mode) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }

  if (!hasAnalyticsKey()) return;
  if (!initialized) return;

  if (mode === 'analytics') {
    posthog.set_config({
      persistence: 'localStorage+cookie',
      disable_session_recording: false,
      capture_pageleave: 'if_capture_pageview',
    });
    posthog.register({ analytics_consent: 'analytics' });
    posthog.startSessionRecording();
  } else {
    posthog.stopSessionRecording();
    posthog.set_config({
      persistence: 'memory',
      disable_session_recording: true,
      capture_pageleave: false,
    });
    posthog.register({ analytics_consent: 'minimal' });
  }

  posthog.capture('analytics_consent_updated', { consent: mode });
}

export { posthog };
