import { Param } from '.';
import { kebabCase, proportionToPercent } from './theme-utils';

/**
 * Create a CSS color-mix expression for a semi transparent foregroundColor
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export const transparentForeground = (alpha: number) => transparentRef('foregroundColor', alpha);

/**
 * Create a CSS color-mix expression for blending the foregroundColor and backgroundColor
 *
 * @param proportion - 0 for background, 1 for foreground
 */
export const opaqueForeground = (proportion: number) =>
  colorMixRefs('backgroundColor', 'foregroundColor', proportion);

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
export const transparentRef = (name: Param, alpha: number) =>
  cssColorMix('transparent', untypedRef(name), alpha);

/**
 * Create a solid 1px border with a transparent foreground color
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export const foregroundBorder = (alpha: number) => 'solid 1px ' + transparentForeground(alpha);

/**
 * Create a CSS color-mix expression that blends two color variables
 *
 * @param alpha - amount of `b` to include in blend: 0 for fully `a`, 1 for fully `b`
 */
export const colorMixRefs = (aName: string, bName: string, bProportion: number) =>
  cssColorMix(untypedRef(aName), untypedRef(bName), bProportion);

const cssColorMix = (a: string, b: string, bAmount: number) => {
  return `color-mix(in srgb, ${a}, ${b} ${proportionToPercent(bAmount)}%)`;
};

/**
 * Create a CSS calc expression from a string containing variable names, for
 * example `calc("gridSize * 4")` produces `"calc(var(--ag-grid-size) * 4)"`
 */
export const calc = (expression: string) =>
  `calc(${expression.replace(/(?<!\w)([a-z][a-z0-9]*\b)(?!\s*\()/gi, untypedRef)})`;

/**
 * Create a CSS expression referring to a variable. For example
 * `ref("foregroundColor")` produces `"var(--ag-foreground-color)"`
 */
export const ref = (name: Param) => untypedRef(name);

const untypedRef = (name: string) => {
  return `var(--ag-${kebabCase(name)})`;
};
