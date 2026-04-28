#!/usr/bin/env node
// Emits `dist/tokens.css` from the JS tokens. Run with
// `npm run build:css` from `packages/design-system/`. The output is
// imported by the website (`web/src/styles/global.css`) so that JS
// remains the single source of truth even on the CSS side.

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

import { palette, neutral, warm, cool, deep, expressive, muted } from '../src/colors.js';
import { lightTheme, darkTheme } from '../src/theme.js';
import { space, layout } from '../src/spacing.js';
import { radius } from '../src/radii.js';
import { shadows } from '../src/shadows.js';
import { duration, easing, easingToCss } from '../src/motion.js';
import { typeScale, families } from '../src/typography.js';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '..', 'dist');
mkdirSync(distDir, { recursive: true });

function kebab(s) {
  return s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function emitFamily(prefix, family) {
  return Object.entries(family)
    .map(([key, value]) => `  --color-${kebab(key)}: ${value};`)
    .join('\n');
}

function emitTheme(theme) {
  const skip = new Set(['name', 'inkRgb']);
  return Object.entries(theme)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => `  --${kebab(k)}: ${v};`)
    .join('\n');
}

function emitSpace() {
  return Object.entries(space)
    .map(([k, v]) => `  --space-${kebab(k)}: ${v}px;`)
    .join('\n');
}

function emitLayout() {
  return Object.entries(layout)
    .map(([k, v]) => `  --layout-${kebab(k)}: ${v}px;`)
    .join('\n');
}

function emitRadius() {
  return Object.entries(radius)
    .map(([k, v]) => `  --radius-${kebab(k)}: ${v === 999 || v === 9999 ? `${v}px` : `${v}px`};`)
    .join('\n');
}

function emitShadows() {
  return Object.entries(shadows)
    .map(([k, v]) => `  --shadow-${kebab(k)}: ${v.css};`)
    .join('\n');
}

function emitMotion() {
  const dur = Object.entries(duration)
    .map(([k, v]) => `  --duration-${kebab(k)}: ${v}ms;`)
    .join('\n');
  const ease = Object.entries(easing)
    .map(([k, v]) => `  --easing-${kebab(k)}: ${easingToCss(v)};`)
    .join('\n');
  return `${dur}\n${ease}`;
}

function emitTypography() {
  const fam = Object.entries(families)
    .map(([role, entry]) => `  --font-${role}: ${entry.cssStack};`)
    .join('\n');

  const scale = Object.entries(typeScale)
    .map(([key, style]) => {
      const sizeExpr = style.size.fluid
        ? `clamp(${style.size.min}px, ${style.size.fluid}, ${style.size.max}px)`
        : `${style.size.max}px`;
      return [
        `  --type-${kebab(key)}-size: ${sizeExpr};`,
        `  --type-${kebab(key)}-line-height: ${style.lineHeight};`,
        `  --type-${kebab(key)}-letter-spacing: ${style.letterSpacing}px;`,
      ].join('\n');
    })
    .join('\n');

  return `${fam}\n${scale}`;
}

const banner = `/**
 * Auto-generated from packages/design-system. Do not edit by hand.
 * Run \`npm run build:css\` from packages/design-system to regenerate.
 */`;

const css = `${banner}

:root {
  /* ---------- Brand palette --------------------------------------- */
${emitFamily('color', neutral)}
${emitFamily('color', warm)}
${emitFamily('color', cool)}
${emitFamily('color', deep)}
${emitFamily('color', expressive)}
${emitFamily('color', muted)}

  /* ---------- Typography ------------------------------------------ */
${emitTypography()}

  /* ---------- Spacing & layout ------------------------------------ */
${emitSpace()}
${emitLayout()}

  /* ---------- Radii ----------------------------------------------- */
${emitRadius()}

  /* ---------- Shadows --------------------------------------------- */
${emitShadows()}

  /* ---------- Motion ---------------------------------------------- */
${emitMotion()}

  /* ---------- Semantic theme (light) ------------------------------ */
  --ink: ${lightTheme.inkRgb};
${emitTheme(lightTheme)}
  --header-height: calc(96px + env(safe-area-inset-top));
}

[data-theme="dark"] {
  --ink: ${darkTheme.inkRgb};
${emitTheme(darkTheme)}
}
`;

writeFileSync(resolve(distDir, 'tokens.css'), css, 'utf8');
console.log(`✓ Wrote ${resolve(distDir, 'tokens.css')}`);
