import Scale from './scale';
export declare const constant: (x: any) => () => any;
export declare const identity: (x: any) => any;
/**
 * An Interpolator factory returns an interpolator function.
 *
 * The first generic corresponds to the data type of the interpolation boundaries.
 * The second generic corresponds to the data type of the return type of the interpolator.
 */
export interface InterpolatorFactory<T, U> {
    /**
     * Construct a new interpolator function, based on the provided interpolation boundaries.
     *
     * @param a Start boundary of the interpolation interval.
     * @param b End boundary of the interpolation interval.
     */
    (a: T, b: T): ((t: number) => U);
}
export default abstract class ContinuousScale implements Scale<any, any> {
    /**
     * The output value of the scale for `undefined` or `NaN` input values.
     */
    unknown: any;
    constructor();
    private _clamp;
    clamp: boolean;
    protected _domain: any[];
    protected setDomain(values: any[]): void;
    protected getDomain(): any[];
    domain: any[];
    protected _range: any[];
    range: any[];
    private input?;
    private output?;
    private piecewise?;
    protected transform: (x: any) => any;
    protected untransform: (x: any) => any;
    private _interpolate;
    interpolate: any;
    protected rescale(): void;
    /**
     * Returns a function that converts `x` in `[a, b]` to `t` in `[0, 1]`. Non-clamping.
     * @param a
     * @param b
     */
    private normalize;
    private bimap;
    convert(x: any): any;
    invert(y: any): any;
}
