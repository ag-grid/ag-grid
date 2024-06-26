import type { Param } from './GENERATED-param-types';
/**
 * Create a CSS color-mix expression for a semi transparent foregroundColor
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export declare const transparentForeground: (alpha: number) => string;
/**
 * Create a CSS color-mix expression for blending the foregroundColor and backgroundColor
 *
 * @param proportion - 0 for background, 1 for foreground
 */
export declare const opaqueForeground: (proportion: number) => string;
/**
 * Create a CSS color-mix expression for a semi transparent accentColor
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export declare const transparentAccent: (alpha: number) => string;
/**
 * Create a CSS color-mix expression for a semi transparent backgroundColor
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export declare const transparentBackground: (alpha: number) => string;
/**
 * Create a CSS color-mix expression for a semi transparent version of a color variable
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export declare const transparentRef: (name: Param, alpha: number) => string;
/**
 * Create a solid 1px border with a transparent foreground color
 *
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export declare const foregroundBorder: (alpha?: number) => string;
/**
 * Create a solid 1px border with a named color, optionally semi-transparent
 *
 * @param name - the color of the border e.g. "accentColor"
 * @param alpha - 0 for fully transparent, 1 for fully opaque
 */
export declare const refBorder: (name: Param, alpha?: number) => string;
/**
 * Create a CSS color-mix expression that blends two color variables
 *
 * @param alpha - amount of `b` to include in blend: 0 for fully `a`, 1 for fully `b`
 */
export declare const colorMixRefs: (aName: string, bName: string, bProportion: number) => string;
/**
 * Create a CSS calc expression from a string containing variable names, for
 * example `calc("gridSize * 4")` produces `"calc(var(--ag-grid-size) * 4)"`
 */
export declare const calc: (expression: string) => string;
/**
 * Create a CSS expression referring to a variable. For example
 * `ref("foregroundColor")` produces `"var(--ag-foreground-color)"`
 */
export declare const ref: (name: Param) => string;
