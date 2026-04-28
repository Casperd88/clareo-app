export interface NeutralFamily {
  paper: string;
  bone: string;
  chalk: string;
  ash: string;
  charcoal: string;
  ink: string;
}

export interface WarmFamily {
  ochre: string;
  saffron: string;
  marigold: string;
  clay: string;
  terracotta: string;
  ember: string;
}

export interface CoolFamily {
  sage: string;
  eucalyptus: string;
  teal: string;
  lagoon: string;
  steel: string;
  slateBlue: string;
}

export interface DeepFamily {
  forest: string;
  moss: string;
  midnight: string;
  petrol: string;
  aubergine: string;
  umber: string;
}

export interface ExpressiveFamily {
  coral: string;
  vermilion: string;
  rose: string;
  plum: string;
  iris: string;
  cobalt: string;
}

export interface MutedFamily {
  sand: string;
  stone: string;
  olive: string;
  dustyBlue: string;
  fadedDenim: string;
  smoke: string;
}

export interface Palette {
  neutral: NeutralFamily;
  warm: WarmFamily;
  cool: CoolFamily;
  deep: DeepFamily;
  expressive: ExpressiveFamily;
  muted: MutedFamily;
}

export const neutral: NeutralFamily;
export const warm: WarmFamily;
export const cool: CoolFamily;
export const deep: DeepFamily;
export const expressive: ExpressiveFamily;
export const muted: MutedFamily;
export const palette: Palette;
export const accentRotation: readonly string[];
export function rgba(hex: string, alpha: number): string;
declare const _default: Palette;
export default _default;
