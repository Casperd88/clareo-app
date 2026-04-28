// 4-pt spacing scale. Use semantic aliases below for layout intent.

export const space = {
  none: 0,
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  jumbo: 56,
  huge: 80,
  monumental: 120,
};

export const layout = {
  pageGutterMobile: space.xl,
  pageGutterDesktop: 48,
  contentMaxWidth: 640,
  contentMaxWidthWide: 1000,
  shellMaxWidth: 1200,
  // Tab bar height on mobile, used to lift floating overlays (mini player, etc).
  tabBar: 85,
  miniPlayer: 64,
  // Brand "tap target" minimum.
  tapTarget: 44,
};

export default { space, layout };
