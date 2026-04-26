import { useEffect, useState } from "react";
import { AudioWaveform } from "lucide-react";
import {
  applyAnalyticsConsent,
  getStoredConsent,
  hasAnalyticsKey,
} from "../lib/analytics";
import styles from "./AnalyticsConsentBanner.module.css";

export default function AnalyticsConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasAnalyticsKey()) return;
    setVisible(getStoredConsent() === null);
  }, []);

  if (!visible) return null;

  const handleAllow = () => {
    applyAnalyticsConsent("analytics");
    setVisible(false);
  };

  const handleMinimal = () => {
    applyAnalyticsConsent("minimal");
    setVisible(false);
  };

  return (
    <div
      className={styles.wrap}
      role="dialog"
      aria-label="Cookie and analytics preferences"
      aria-describedby="consent-desc"
    >
      <div className={styles.card}>
        <div className={styles.top}>
          <AudioWaveform
            className={styles.waveformIcon}
            strokeWidth={1.5}
            aria-hidden
          />
          <p id="consent-desc" className={styles.body}>
            Clareo runs on thoughtful data, not surveillance. Allow deeper
            analytics to help us improve Clareo.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={handleAllow}
          >
            Allow analytics
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={handleMinimal}
          >
            Keep it minimal
          </button>
        </div>
      </div>
    </div>
  );
}
