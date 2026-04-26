import { useState } from "react";
import { Sparkles, Headphones, ArrowRight, Check } from "lucide-react";
import Layout from "../components/Layout";
import HeroCollage from "../components/HeroCollage";
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
      <svg width="0" height="0" style={{ position: 'absolute' }}>
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
          <p className={styles.badge}>
            <svg className={styles.appleLogo} viewBox="0 0 384 512" fill="currentColor">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Coming to iOS
          </p>
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
