export interface Space {
  none: 0;
  xxxs: 2;
  xxs: 4;
  xs: 8;
  sm: 12;
  md: 16;
  lg: 20;
  xl: 24;
  xxl: 32;
  xxxl: 40;
  jumbo: 56;
  huge: 80;
  monumental: 120;
}

export const space: Space;

export interface Layout {
  pageGutterMobile: number;
  pageGutterDesktop: number;
  contentMaxWidth: number;
  contentMaxWidthWide: number;
  shellMaxWidth: number;
  tabBar: number;
  miniPlayer: number;
  tapTarget: number;
}
export const layout: Layout;

declare const _default: { space: Space; layout: Layout };
export default _default;
