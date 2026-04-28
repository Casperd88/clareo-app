// Semantic theme objects. Components should bind to these names
// (`primary`, `surface`, `bg`, etc.) — never to a raw hex. That way
// dark mode + future palette tweaks are free.
//
// The same role names ship to the website as CSS variables (see
// `dist/tokens.css`, regenerated from this file).

import { neutral, expressive, rgba, accentRotation } from './colors.js';

const lightInkRgb = '26, 29, 36'; // neutral.ink, exposed as r,g,b for rgba()

export const lightTheme = {
  name: 'light',
  // Surface stack (back to front).
  bg: '#F1EDE9', // brand cream paper, slightly warmer than neutral.paper
  bgRaised: neutral.paper,
  surface: 'rgba(255, 255, 255, 0.95)',
  surfaceSecondary: 'rgba(255, 255, 255, 0.6)',
  surfaceMuted: rgba(neutral.ink, 0.04),
  scrim: rgba(neutral.ink, 0.45),

  // Ink stack.
  primary: neutral.ink,
  primaryInverse: '#FFFFFF',
  secondary: rgba(neutral.ink, 0.5),
  tertiary: rgba(neutral.ink, 0.32),
  quaternary: rgba(neutral.ink, 0.18),
  disabled: rgba(neutral.ink, 0.24),

  // Lines.
  border: rgba(neutral.ink, 0.08),
  borderStrong: rgba(neutral.ink, 0.2),

  // States.
  toggleHover: rgba(neutral.ink, 0.04),
  selectionBg: 'rgba(88, 86, 214, 0.22)',
  selectionFg: neutral.ink,

  // Status / signal.
  success: '#34A75A',
  warning: expressive.coral,
  danger: expressive.vermilion,
  successOnDark: '#5FCC85',
  dangerOnDark: '#FF6E5C',

  // Editorial accents — for art-directed pops, fallback covers, etc.
  accent: expressive.cobalt,
  accentWarm: expressive.coral,
  accentCool: expressive.iris,

  // Raw rgb tokens for places that need to compose `rgba(var(--ink), .x)`.
  inkRgb: lightInkRgb,
};

const darkInkRgb = '255, 255, 255';

export const darkTheme = {
  name: 'dark',
  bg: neutral.ink, // #1A1D24
  bgRaised: '#1F232C',
  surface: 'rgba(30, 34, 44, 0.95)',
  surfaceSecondary: 'rgba(30, 34, 44, 0.6)',
  surfaceMuted: 'rgba(255, 255, 255, 0.06)',
  scrim: 'rgba(0, 0, 0, 0.55)',

  primary: '#FFFFFF',
  primaryInverse: neutral.ink,
  secondary: 'rgba(255, 255, 255, 0.72)',
  tertiary: 'rgba(255, 255, 255, 0.48)',
  quaternary: 'rgba(255, 255, 255, 0.24)',
  disabled: 'rgba(255, 255, 255, 0.28)',

  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',

  toggleHover: 'rgba(255, 255, 255, 0.08)',
  selectionBg: 'rgba(147, 152, 255, 0.35)',
  selectionFg: '#F4F4F8',

  success: '#5FCC85',
  warning: expressive.coral,
  danger: expressive.vermilion,
  successOnDark: '#5FCC85',
  dangerOnDark: '#FF6E5C',

  accent: expressive.iris,
  accentWarm: expressive.coral,
  accentCool: '#9398FF',

  inkRgb: darkInkRgb,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Hash-based picker for palette-driven fallbacks (book covers, etc).
// Stable across renders for a given input; same algorithm on web + native.
export function pickAccent(seed) {
  const s = typeof seed === 'string' && seed.length > 0 ? seed : 'clareo';
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return accentRotation[h % accentRotation.length];
}

export default themes;
