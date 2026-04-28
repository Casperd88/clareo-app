export type FontRole = 'display' | 'body' | 'ui';

export interface FontFamilyEntry {
  cssStack: string;
  nativeFamilies: Record<string, string>;
}

export const FONT_ROLES: Record<FontRole, FontRole>;

export const families: Record<FontRole, FontFamilyEntry>;

export interface ResponsiveSize {
  min: number;
  fluid: string | null;
  max: number;
  native: number;
}

export interface TypeStyle {
  role: FontRole;
  weight: string;
  size: ResponsiveSize;
  letterSpacing: number;
  lineHeight: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

export type TypeScaleKey =
  | 'hero'
  | 'heroAccent'
  | 'display'
  | 'displayItalic'
  | 'title'
  | 'sectionLabel'
  | 'eyebrow'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'pill';

export const typeScale: Record<TypeScaleKey, TypeStyle>;

declare const _default: {
  FONT_ROLES: typeof FONT_ROLES;
  families: typeof families;
  typeScale: typeof typeScale;
};
export default _default;
