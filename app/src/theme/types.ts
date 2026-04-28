import type { TextStyle } from 'react-native';
import type {
  Palette,
  SemanticTheme,
  TypeScaleKey,
  Space,
  Layout,
  Radius,
  Shadows,
  Duration,
  Easing,
} from '@clareo/design-system';

export type ColorSchemeName = 'light' | 'dark';
export type ColorSchemePreference = ColorSchemeName | 'system';

// What every styled component pulls out of useTheme().
export interface AppTheme {
  scheme: ColorSchemeName;
  colors: SemanticTheme;
  palette: Palette;
  type: Record<TypeScaleKey, TextStyle>;
  fonts: {
    display: { regular: string; italic: string; light: string; lightItalic: string };
    body: { light: string; regular: string; medium: string; bold: string };
    ui: { light: string; regular: string; bold: string };
  };
  space: Space;
  layout: Layout;
  radius: Radius;
  shadows: Shadows;
  motion: { duration: Duration; easing: Easing };
}
