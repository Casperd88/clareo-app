import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={styles.iconWrapper}>
        <Sun className={`${styles.icon} ${styles.sun} ${!isDark ? styles.active : ''}`} />
        <Moon className={`${styles.icon} ${styles.moon} ${isDark ? styles.active : ''}`} />
      </span>
    </button>
  );
}
