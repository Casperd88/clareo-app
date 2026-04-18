import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import SiteNavLink from './SiteNavLink';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const headerRef = useRef(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const navLinks = [
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <Logo />
        </Link>

        <div className={styles.navGroup}>
          <nav className={styles.desktopNav}>
            {navLinks.map((link) => (
              <SiteNavLink key={link.to} to={link.to}>
                {link.label}
              </SiteNavLink>
            ))}
          </nav>
          <div className={styles.trailing}>
            <ThemeToggle />
            <button
              type="button"
              className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            className={styles.mobileNav}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`${styles.mobileLink} ${location.pathname === link.to ? styles.active : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
