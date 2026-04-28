export interface SemanticTheme {
  name: 'light' | 'dark';
  bg: string;
  bgRaised: string;
  surface: string;
  surfaceSecondary: string;
  surfaceMuted: string;
  scrim: string;

  primary: string;
  primaryInverse: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  disabled: string;

  border: string;
  borderStrong: string;

  toggleHover: string;
  selectionBg: string;
  selectionFg: string;

  success: string;
  warning: string;
  danger: string;
  successOnDark: string;
  dangerOnDark: string;

  accent: string;
  accentWarm: string;
  accentCool: string;

  inkRgb: string;
}

export const lightTheme: SemanticTheme;
export const darkTheme: SemanticTheme;
export const themes: { light: SemanticTheme; dark: SemanticTheme };

export function pickAccent(seed: string): string;

declare const _default: typeof themes;
export default _default;
