import { useState } from "react";
import { Sparkles, Headphones, ArrowRight, Check } from "lucide-react";
import Layout from "../components/Layout";
import HeroCollage from "../components/HeroCollage";
import { getClareoAppGetStartedUrl } from "../lib/appUrl";
import styles from "./Home.module.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <Layout>
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="gradientPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2d55" />
            <stop offset="100%" stopColor="#af52de" />
          </linearGradient>
          <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5ac8fa" />
            <stop offset="100%" stopColor="#5856d6" />
          </linearGradient>
        </defs>
      </svg>

      <section className={styles.hero}>
        <HeroCollage />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            The best ideas,
            <br />
            <span className={styles.gradient}>distilled.</span>
          </h1>
          <p className={styles.description}>
            Original interpretations of influential books,
            <br />
            refined into clear, listenable insight.
          </p>
          <a
            href={getClareoAppGetStartedUrl()}
            className={styles.badge}
            rel="noopener noreferrer"
          >
            Get started
          </a>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutItem}>
            <div className={styles.iconTile}>
              <Sparkles className={styles.iconPink} />
            </div>
            <div className={styles.aboutText}>
              <h3>What is Clareo</h3>
              <p>
                Clareo turns complex books into clear thinking. Each piece is
                rebuilt from first principles, so you get what matters, fast.
              </p>
            </div>
          </div>
          <div className={styles.aboutItem}>
            <div className={styles.iconTile}>
              <Headphones className={styles.iconBlue} />
            </div>
            <div className={styles.aboutText}>
              <h3>Why audio</h3>
              <p>Designed for listening, so ideas can move with you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.subscribe}>
        <div className={styles.subscribeContent}>
          <h2 className={styles.subscribeTitle}>Get early access</h2>
          <p className={styles.subscribeText}>
            The first ideas go to a small group.
          </p>

          {status === "success" ? (
            <div className={styles.successMessage}>
              <Check className={styles.checkIcon} />
              <span>You're on the list</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.subscribeForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={styles.emailInput}
                required
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className={styles.loadingDot} />
                ) : (
                  <ArrowRight className={styles.arrowIcon} />
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className={styles.errorText}>Something went wrong. Try again.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
