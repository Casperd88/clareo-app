import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'clareo-theme';
const HAS_PREFERENCE_KEY = 'clareo-theme-manual';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasManualPreference = localStorage.getItem(HAS_PREFERENCE_KEY) === 'true';
    if (hasManualPreference) {
      return localStorage.getItem(STORAGE_KEY) === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const hasManualPreference = localStorage.getItem(HAS_PREFERENCE_KEY) === 'true';
    if (hasManualPreference) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggle = () => {
    localStorage.setItem(HAS_PREFERENCE_KEY, 'true');
    setIsDark((prev) => {
      localStorage.setItem(STORAGE_KEY, !prev ? 'dark' : 'light');
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
