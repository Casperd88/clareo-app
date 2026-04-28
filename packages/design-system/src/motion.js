// Motion tokens. The website uses these durations + easings across
// hover transitions, page transitions, and parallax. Native consumers
// can feed `duration` straight into Reanimated's `withTiming`.

export const duration = {
  instant: 80,
  quick: 150,
  base: 200,
  smooth: 300,
  emphatic: 500,
  fade: 700,
  reveal: 1000,
};

// Easing curves authored as cubic-bezier control points so the same
// values can drive CSS `cubic-bezier(...)` and Reanimated's `Easing.bezier(...)`.
export const easing = {
  // Apple-y default (in/out).
  standard: [0.25, 0.1, 0.25, 1],
  // Material decelerate for sheets and reveals.
  decelerate: [0.0, 0.0, 0.2, 1],
  // Material accelerate for exits.
  accelerate: [0.4, 0.0, 1, 1],
  // Quick + soft for hover.
  hover: [0.2, 0, 0.2, 1],
};

export function easingToCss([a, b, c, d]) {
  return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
}

export default { duration, easing, easingToCss };
