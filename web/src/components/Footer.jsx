import { Link } from "react-router-dom";
import Logo from "./Logo";
import SiteNavLink from "./SiteNavLink";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLockup} aria-label="Clareo home">
            <Logo className={styles.logo} />
            <span className={styles.brandName}>Clareo</span>
          </Link>
          <p className={styles.tagline}>The best ideas, distilled.</p>
        </div>

        <nav className={styles.nav} aria-label="Footer">
          <SiteNavLink to="/about">About</SiteNavLink>
          <SiteNavLink to="/contact">Contact</SiteNavLink>
          <SiteNavLink to="/privacy">Privacy</SiteNavLink>
          <SiteNavLink to="/terms">Terms</SiteNavLink>
        </nav>

        <p className={styles.copyright}>© 2026 Clareo Technologies LLC</p>
      </div>
    </footer>
  );
}
