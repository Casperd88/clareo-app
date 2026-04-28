export interface NativeShadow {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

export interface Shadow {
  css: string;
  native: NativeShadow;
}

export interface Shadows {
  none: Shadow;
  tile: Shadow;
  card: Shadow;
  floating: Shadow;
  glow: Shadow;
}

export const shadows: Shadows;
declare const _default: Shadows;
export default _default;
