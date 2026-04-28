// Shadows are tricky to share — CSS uses a single string, RN uses
// discrete fields. We keep both representations side by side.

export const shadows = {
  none: {
    css: 'none',
    native: { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  },
  // Tile / icon-tile lift, used on light surfaces.
  tile: {
    css: '0 4px 16px rgba(26, 29, 36, 0.08)',
    native: {
      shadowColor: '#1A1D24',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  },
  // Card / cover lift.
  card: {
    css: '0 8px 32px rgba(26, 29, 36, 0.10), 0 2px 8px rgba(26, 29, 36, 0.04)',
    native: {
      shadowColor: '#1A1D24',
      shadowOpacity: 0.10,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  },
  // Floating UI: pill buttons, mini player.
  floating: {
    css: '0 8px 40px rgba(26, 29, 36, 0.10), 0 1px 3px rgba(26, 29, 36, 0.04)',
    native: {
      shadowColor: '#1A1D24',
      shadowOpacity: 0.10,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
  // Ambient glow used for the editorial pill on dark surfaces.
  glow: {
    css: '0 10px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    native: {
      shadowColor: '#000000',
      shadowOpacity: 0.45,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },
  },
};

export default shadows;
