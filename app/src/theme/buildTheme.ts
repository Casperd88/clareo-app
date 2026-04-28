import type { TextStyle } from 'react-native';
import {
  palette,
  typography,
  spacing,
  radius,
  shadows,
  motion,
  themes,
} from '@clareo/design-system';
import type { AppTheme, ColorSchemeName } from './types';

const { families, typeScale } = typography;
const { space, layout } = spacing;

const FONT_WEIGHT_MAP: Record<string, TextStyle['fontWeight']> = {
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
  italic: '400',
  lightItalic: '300',
};

function buildTypeStyles(): AppTheme['type'] {
  const out: Record<string, TextStyle> = {};
  (Object.keys(typeScale) as Array<keyof typeof typeScale>).forEach((key) => {
    const style = typeScale[key];
    const family = families[style.role];
    const fontFamily =
      family.nativeFamilies[style.weight as keyof typeof family.nativeFamilies] ??
      family.nativeFamilies.regular ??
      Object.values(family.nativeFamilies)[0];

    const lineHeight = Math.round(style.size.native * style.lineHeight);
    const isItalic = style.weight.toLowerCase().includes('italic');

    const textStyle: TextStyle = {
      fontFamily,
      fontSize: style.size.native,
      lineHeight,
      letterSpacing: style.letterSpacing,
      fontWeight: FONT_WEIGHT_MAP[style.weight] ?? '400',
    };

    if (isItalic) textStyle.fontStyle = 'italic';
    if (style.textTransform) textStyle.textTransform = style.textTransform;

    out[key] = textStyle;
  });
  return out as AppTheme['type'];
}

const TYPE_STYLES = buildTypeStyles();

const FONT_BUNDLE: AppTheme['fonts'] = {
  display: families.display.nativeFamilies as AppTheme['fonts']['display'],
  body: families.body.nativeFamilies as AppTheme['fonts']['body'],
  ui: families.ui.nativeFamilies as AppTheme['fonts']['ui'],
};

export function buildAppTheme(scheme: ColorSchemeName): AppTheme {
  return {
    scheme,
    colors: themes[scheme],
    palette,
    type: TYPE_STYLES,
    fonts: FONT_BUNDLE,
    space,
    layout,
    radius,
    shadows,
    motion: { duration: motion.duration, easing: motion.easing },
  };
}
