// Typography system, by role.
//
// Every consumer (web/app) maps these roles to a concrete font face
// via the `families` lookup. Web uses the licensed Pangram Pangram
// faces; native uses Instrument Serif + MatterSQ as the editorial
// surrogate. If we later bundle the PP TTFs into the app, only
// `families.native` needs to change.

export const FONT_ROLES = {
  display: 'display',
  body: 'body',
  ui: 'ui',
};

// Concrete font faces per platform.
//   - `cssStack`: a CSS font-family stack for the web
//   - `nativeFamilies`: per-weight/style native font names
// All native names assume the fonts are loaded with the same key in
// `useFonts({ ... })` on the consumer side.
export const families = {
  display: {
    cssStack:
      '"PP Editorial New", "Instrument Serif", Georgia, "Times New Roman", serif',
    nativeFamilies: {
      regular: 'InstrumentSerif-Regular',
      italic: 'InstrumentSerif-Italic',
      light: 'InstrumentSerif-Regular',
      lightItalic: 'InstrumentSerif-Italic',
    },
  },
  body: {
    cssStack:
      '"PP Neue Gstaad", "MatterSQ", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    nativeFamilies: {
      light: 'MatterSQ-Light',
      regular: 'MatterSQ-Regular',
      medium: 'MatterSQ-Medium',
      bold: 'MatterSQ-Bold',
    },
  },
  ui: {
    cssStack:
      '"PP Neue Gstaad Wide", "PP Neue Gstaad", "MatterSQ", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    nativeFamilies: {
      light: 'MatterSQ-Medium',
      regular: 'MatterSQ-Medium',
      bold: 'MatterSQ-Bold',
    },
  },
};

// Type scale, role-tagged. Sizes are points/px (interchangeable in RN).
// `letterSpacing` is in points; convert to em on the web if you need.
// `lineHeight` is unitless.
export const typeScale = {
  hero: {
    role: 'display',
    weight: 'regular',
    size: { min: 48, fluid: '8.4vw', max: 96, native: 56 },
    letterSpacing: -2,
    lineHeight: 1.02,
  },
  heroAccent: {
    role: 'display',
    weight: 'lightItalic',
    size: { min: 52, fluid: '9vw', max: 104, native: 60 },
    letterSpacing: -2.5,
    lineHeight: 1.02,
  },
  display: {
    role: 'display',
    weight: 'regular',
    size: { min: 32, fluid: '5vw', max: 56, native: 40 },
    letterSpacing: -1,
    lineHeight: 1.05,
  },
  displayItalic: {
    role: 'display',
    weight: 'italic',
    size: { min: 32, fluid: '5vw', max: 56, native: 36 },
    letterSpacing: -1,
    lineHeight: 1.1,
  },
  title: {
    role: 'display',
    weight: 'regular',
    size: { min: 28, fluid: '4vw', max: 42, native: 32 },
    letterSpacing: -0.5,
    lineHeight: 1.15,
  },
  sectionLabel: {
    role: 'ui',
    weight: 'regular',
    size: { min: 16, fluid: '1.3vw', max: 20, native: 17 },
    letterSpacing: -0.2,
    lineHeight: 1.3,
  },
  // Wide / uppercase eyebrow used by Footer + section headers on web.
  eyebrow: {
    role: 'ui',
    weight: 'regular',
    size: { min: 12, fluid: null, max: 13, native: 12 },
    letterSpacing: 1.4,
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
  bodyLarge: {
    role: 'body',
    weight: 'light',
    size: { min: 17, fluid: '1.4vw', max: 20, native: 18 },
    letterSpacing: 0,
    lineHeight: 1.7,
  },
  body: {
    role: 'body',
    weight: 'regular',
    size: { min: 15, fluid: '1.1vw', max: 17, native: 16 },
    letterSpacing: 0,
    lineHeight: 1.6,
  },
  bodySmall: {
    role: 'body',
    weight: 'regular',
    size: { min: 13, fluid: null, max: 14, native: 14 },
    letterSpacing: 0,
    lineHeight: 1.55,
  },
  caption: {
    role: 'body',
    weight: 'regular',
    size: { min: 12, fluid: null, max: 13, native: 12 },
    letterSpacing: 0,
    lineHeight: 1.5,
  },
  pill: {
    role: 'body',
    weight: 'regular',
    size: { min: 13, fluid: '1vw', max: 15, native: 15 },
    letterSpacing: 0.3,
    lineHeight: 1,
  },
};

export default {
  FONT_ROLES,
  families,
  typeScale,
};
