import { useState, useRef, useEffect } from "react";
import styles from "./EmailLink.module.css";

const FEEDBACK_MS = 2000;

export default function EmailLink({
  user = "hello",
  domain = "tryclareo.com",
  className,
  muted = false,
}) {
  const [copied, setCopied] = useState(false);
  const [copyBurst, setCopyBurst] = useState(0);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const email = `${user}@${domain}`;

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setCopied(false), FEEDBACK_MS);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const onSuccess = () => {
      setCopyBurst((n) => n + 1);
      setCopied(true);
      scheduleHide();
    };

    try {
      await navigator.clipboard.writeText(email);
      onSuccess();
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      onSuccess();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.button} ${muted ? styles.buttonMuted : ""} ${className || ""}`}
      type="button"
    >
      <span className={`${styles.email} ${muted ? styles.emailMuted : ""}`}>{email}</span>
      {copied && (
        <span className={styles.feedback} key={copyBurst}>
          Copied!
        </span>
      )}
    </button>
  );
}
