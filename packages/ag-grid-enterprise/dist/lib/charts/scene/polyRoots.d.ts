// ag-grid-enterprise v21.2.2
/**
 * Finds the roots of a parametric linear equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 */
export declare function linearRoot(a: number, b: number): number[];
/**
 * Finds the roots of a parametric quadratic equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 */
export declare function quadraticRoots(a: number, b: number, c: number): number[];
/**
 * Finds the roots of a parametric cubic equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 * Returns an array of parametric intersection locations along the cubic,
 * excluding out-of-bounds intersections (before or after the end point
 * or in the imaginary plane).
 * An adaptation of http://www.particleincell.com/blog/2013/cubic-line-intersection/
 */
export declare function cubicRoots(a: number, b: number, c: number, d: number): number[];
