export interface Duration {
  instant: number;
  quick: number;
  base: number;
  smooth: number;
  emphatic: number;
  fade: number;
  reveal: number;
}

export type EasingCurve = readonly [number, number, number, number];

export interface Easing {
  standard: EasingCurve;
  decelerate: EasingCurve;
  accelerate: EasingCurve;
  hover: EasingCurve;
}

export const duration: Duration;
export const easing: Easing;
export function easingToCss(curve: EasingCurve): string;

declare const _default: {
  duration: Duration;
  easing: Easing;
  easingToCss: typeof easingToCss;
};
export default _default;
