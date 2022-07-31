import { Scale } from './scale';
export declare function clamper(domain: number[]): (x: number) => number;
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
    (a: T, b: T): (t: number) => U;
}
export declare abstract class ContinuousScale implements Scale<any, any> {
    /**
     * The output value of the scale for `undefined` or `NaN` input values.
     */
    unknown: any;
    constructor();
    clamper: typeof clamper;
    protected _clamp: (x: any) => any;
    set clamp(value: boolean);
    get clamp(): boolean;
    protected _domain: any[];
    protected setDomain(values: any[]): void;
    protected getDomain(): any[];
    set domain(values: any[]);
    get domain(): any[];
    protected _range: any[];
    set range(values: any[]);
    get range(): any[];
    private input?;
    private output?;
    private piecewise?;
    protected transform: (x: any) => any;
    protected untransform: (x: any) => any;
    private _interpolate;
    set interpolate(value: any);
    get interpolate(): any;
    protected rescale(): void;
    /**
     * Returns a function that converts `x` in `[a, b]` to `t` in `[0, 1]`. Non-clamping.
     * @param a
     * @param b
     */
    private normalize;
    private bimap;
    private polymap;
    convert(x: any, clamper?: (values: number[]) => (x: number) => number): any;
    invert(y: any): any;
}
