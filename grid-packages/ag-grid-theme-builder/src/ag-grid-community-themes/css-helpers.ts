import { kebabCase, proportionToPercent } from './theme-utils';

/**
 * Create a CSS color-mix expression for a semi transparent foregroundColor
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export const transparentForeground = (alpha: number) => transparentRef('foregroundColor', alpha);

/**
 * Create a CSS color-mix expression for a semi transparent accentColor
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export const transparentAccent = (alpha: number) => transparentRef('accentColor', alpha);

/**
 * Create a CSS color-mix expression for a semi transparent backgroundColor
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export const transparentBackground = (alpha: number) => transparentRef('backgroundColor', alpha);

/**
 * Create a CSS color-mix expression for a semi transparent version of a color variable
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export const transparentRef = (name: string, alpha: number) =>
  cssColorMix('transparent', ref(name), alpha);

/**
 * Create a CSS color-mix expression that blends two color variables
 *
 * @param alpha - amount of `b` to include in blend: 0 for fully `a`, 1 for fully `b`
 */
export const colorMixRefs = (aName: string, bName: string, bProportion: number) =>
  cssColorMix(ref(aName), ref(bName), bProportion);

const cssColorMix = (a: string, b: string, bAmount: number) => {
  return `color-mix(in srgb, ${a}, ${b} ${proportionToPercent(bAmount)}%)`;
};

/**
 * Create a CSS calc expression from a string containing variable names, for
 * example `calc("gridSize * 4")` produces `"calc(var(--ag-grid-size) * 4)"`
 */
// TODO tests and validation
export const calc = (expression: string) =>
  `calc(${expression.replace(/(?<!\w)([a-z][a-z0-9]*\b)(?!\s*\()/gi, ref)})`;

/**
 * Create a CSS expression referring to a variable. For example
 * `ref("foregroundColor")` produces `"var(--ag-foreground-color)"`
 */
// TODO validate variable name in JS and TS typing
export const ref = (name: string) => `var(--ag-${kebabCase(name)})`;
