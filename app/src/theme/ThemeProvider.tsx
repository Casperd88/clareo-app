import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { buildAppTheme } from './buildTheme';
import type { AppTheme, ColorSchemeName, ColorSchemePreference } from './types';

interface ThemeContextValue {
  theme: AppTheme;
  scheme: ColorSchemeName;
  preference: ColorSchemePreference;
  setPreference: (next: ColorSchemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface Props {
  children: React.ReactNode;
  initialPreference?: ColorSchemePreference;
}

function resolveScheme(
  preference: ColorSchemePreference,
  systemScheme: ColorSchemeName | null,
): ColorSchemeName {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemScheme ?? 'light';
}

export function ThemeProvider({ children, initialPreference = 'light' }: Props) {
  const systemScheme = useColorScheme() ?? Appearance.getColorScheme() ?? 'light';
  const [preference, setPreference] = useState<ColorSchemePreference>(initialPreference);

  // Keep system listener active so 'system' preference reacts live.
  const [systemSnapshot, setSystemSnapshot] = useState<ColorSchemeName>(
    (systemScheme as ColorSchemeName) ?? 'light',
  );
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemSnapshot((colorScheme as ColorSchemeName) ?? 'light');
    });
    return () => sub.remove();
  }, []);

  const scheme = useMemo(
    () => resolveScheme(preference, systemSnapshot),
    [preference, systemSnapshot],
  );

  const theme = useMemo(() => buildAppTheme(scheme), [scheme]);

  const toggle = useCallback(() => {
    setPreference((prev) => {
      const current = resolveScheme(prev, systemSnapshot);
      return current === 'light' ? 'dark' : 'light';
    });
  }, [systemSnapshot]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, scheme, preference, setPreference, toggle }),
    [theme, scheme, preference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }
  return ctx.theme;
}

export function useThemeControl(): Omit<ThemeContextValue, 'theme'> {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeControl must be used inside <ThemeProvider>.');
  }
  const { theme: _theme, ...rest } = ctx;
  return rest;
}
