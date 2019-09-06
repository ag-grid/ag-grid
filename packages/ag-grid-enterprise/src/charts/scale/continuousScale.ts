import { Comparator, ascending } from "../util/compare";
import interpolateValue from "../interpolate/value";
import interpolateNumber from "../interpolate/number";
import Scale, {
    Deinterpolator,
    DeinterpolatorFactory,
    PiecewiseDeinterpolatorFactory,
    PiecewiseReinterpolatorFactory,
    Reinterpolator,
    ReinterpolatorFactory,
} from './scale';
import { bisectRight } from "../util/bisect";

export const constant = (x: any) => () => x;
export const identity = (x: any) => x;

function clamper(domain: number[]): (x: number) => number {
    let a = domain[0];
    let b = domain[domain.length - 1];

    if (a > b) {
        [a, b] = [b, a];
    }

    return x => Math.max(a, Math.min(b, x));
}

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

export default abstract class ContinuousScale<R> implements Scale<number, R> {
    /**
     * The output value of the scale for `undefined` or `NaN` input values.
     */
    unknown: any = undefined;

    private _clamp = identity;
    set clamp(value: boolean) {
        this._clamp = value ? clamper(this.domain) : identity;
    }
    get clamp(): boolean {
        return this._clamp !== identity;
    }

    protected _domain: number[] = [0, 1];
    set domain(values: number[]) {
        this._domain = Array.prototype.map.call(values, (v: any) => +v);
        if (this._clamp !== identity) {
            this._clamp = clamper(this.domain);
        }
        this.rescale();
    }
    get domain(): number[] {
        return this._domain.slice();
    }

    protected _range: R[] = [];
    set range(values: R[]) {
        this._range = Array.prototype.slice.call(values);
        this.rescale();
    }
    get range(): R[] {
        return this._range.slice();
    }

    private input?: (t: R) => number; // D
    private output?: (t: number) => R;
    private piecewise?: (domain: any[], range: any[], interpolate: (a: any, b: any) => (t: number) => any) => (x: any) => any;

    protected transform: (x: number) => number = identity;   // returns t in [0, 1]
    protected untransform: (x: number) => number = identity;

    // constructor(transform: (x: number) => R, untransform: (x: R) => number) {
    //     this.transform = transform;
    //     this.untransform = untransform;
    // }

    private _interpolate: InterpolatorFactory<any, any> = interpolateValue;
    set interpolate(value: any) {
        this._interpolate = value;
        this.rescale();
    }
    get interpolate(): any {
        return this._interpolate;
    }

    protected rescale() {
        if (Math.min(this.domain.length, this.range.length) > 2) {
            this.piecewise = this.polymap;
        } else {
            this.piecewise = this.bimap;
        }
        this.output = undefined;
        this.input = undefined;
    }

    /**
     * Returns a function that converts `x` in `[a, b]` to `t` in `[0, 1]`. Non-clamping.
     * @param a
     * @param b
     */
    private normalize(a: any, b: any): (x: any) => number {
        return (b -= (a = +a))
            ? (x: any) => (x - a) / b
            : constant(isNaN(b) ? NaN : 0.5);
    }

    private bimap(domain: any[], range: R[], interpolate: (a: any, b: any) => (t: number) => any): (x: any) => R {
        const x0 = domain[0];
        const x1 = domain[1];
        const y0 = range[0];
        const y1 = range[1];

        let xt: Deinterpolator<any>;
        let ty: Reinterpolator<R>;

        if (x1 < x0) {
            xt = this.normalize(x1, x0);
            ty = interpolate(y1, y0);
        } else {
            xt = this.normalize(x0, x1);
            ty = interpolate(y0, y1);
        }

        return (x) => ty(xt(x)); // domain value x --> t in [0, 1] --> range value y
    }

    private polymap(domain: any[], range: R[], interpolate: (a: any, b: any) => (t: number) => any): Reinterpolator<R> {
        // number of segments in the polylinear scale
        const n = Math.min(domain.length, range.length) - 1;

        if (domain[n] < domain[0]) {
            domain = domain.slice().reverse();
            range = range.slice().reverse();
        }

        // deinterpolators from domain segment value to t
        const dt = Array.from( {length: n}, (_, i) => this.normalize(domain[i], domain[i+1]) );
        // reinterpolators from t to range segment value
        const tr = Array.from( {length: n}, (_, i) => interpolate(range[i], range[i+1]) );

        return (x) => {
            const i = bisectRight(domain, x, ascending, 1, n) - 1; // Find the domain segment that `x` belongs to.
            // This also tells us which deinterpolator/reinterpolator pair to use.
            return tr[i](dt[i](x));
        };
    }

    convert(x: number): R {
        x = +x;
        if (isNaN(x)) {
            return this.unknown;
        } else {
            if (!this.output) {
                this.output = this.piecewise!(this.domain.map(this.transform), this.range, this.interpolate);
            }
            return this.output(this.transform(this._clamp(x)));
        }
    }

    invert(y: R): number {
        if (!this.input) {
            this.input = this.piecewise!(this.range, this.domain.map(this.transform), interpolateNumber);
        }
        return this._clamp(this.untransform(this.input(y)));
    }
}

export abstract class ContinuousScaleOld<R> implements Scale<number, R> {
    constructor(reinterpolatorFactory: ReinterpolatorFactory<R>,
                deinterpolatorFactory?: DeinterpolatorFactory<R>,
                rangeComparator?: Comparator<R>) {
        this.reinterpolatorFactory = reinterpolatorFactory;
        this.deinterpolatorFactory = deinterpolatorFactory;
        this.rangeComparator = rangeComparator;
    }

    private readonly reinterpolatorFactory: ReinterpolatorFactory<R>;
    private readonly deinterpolatorFactory?: DeinterpolatorFactory<R>;
    private readonly rangeComparator?: Comparator<R>;

    private piecewiseReinterpolatorFactory?: PiecewiseReinterpolatorFactory<R>;
    private piecewiseReinterpolator?: Reinterpolator<R>;

    private piecewiseDeinterpolatorFactory?: PiecewiseDeinterpolatorFactory<R>;
    private piecewiseDeinterpolator?: Deinterpolator<R>;

    protected _domain: number[] = [0, 1];
    set domain(values: number[]) {
        this._domain = values.slice();
        this.rescale();
    }
    get domain(): number[] {
        return this._domain;
    }

    protected _range: R[] = [];
    set range(values: R[]) {
        this._range = values.slice();
        this.rescale();
    }
    get range(): R[] {
        return this._range;
    }

    clamp: boolean = false;

    convert(d: number): R {
        if (!this.piecewiseReinterpolator) {
            if (!this.piecewiseReinterpolatorFactory) {
                throw new Error('Missing piecewiseReinterpolatorFactory');
            }
            const deinterpolatorFactory = this.clamp
                ? this.clampDeinterpolatorFactory(this.deinterpolatorOf)
                : this.deinterpolatorOf;
            this.piecewiseReinterpolator = this.piecewiseReinterpolatorFactory(
                this._domain, this._range,
                deinterpolatorFactory, this.reinterpolatorFactory
            );
        }
        if (!this.piecewiseReinterpolator) {
            throw new Error('Missing piecewiseReinterpolator');
        }
        return this.piecewiseReinterpolator(d);
    }

    invert(r: R): number {
        if (!this.deinterpolatorFactory) {
            throw new Error('Missing deinterpolatorFactory');
        }
        if (!this.piecewiseDeinterpolator) {
            if (!this.piecewiseDeinterpolatorFactory) {
                throw new Error('Missing piecewiseDeinterpolatorFactory');
            }
            const reinterpolatorFactory = this.clamp
                ? this.clampReinterpolatorFactory(this.reinterpolatorOf)
                : this.reinterpolatorOf;
            this.piecewiseDeinterpolator = this.piecewiseDeinterpolatorFactory(this._range, this._domain,
                this.deinterpolatorFactory, reinterpolatorFactory);
        }
        return this.piecewiseDeinterpolator(r);
    }

    /**
     * Creates a new deinterpolator for the given pair of output range numbers.
     * The deinterpolator accepts a single parameter `v` in the [a, b] range
     * and returns a value in the [0, 1] range.
     * @param a
     * @param b
     */
    protected abstract deinterpolatorOf(a: number, b: number): Deinterpolator<number>;

    /**
     * Creates a new interpolator for the given pair of input domain numbers.
     * The interpolator accepts a single parameter `t` in the [0, 1] range and
     * returns a value in the [a, b] range.
     * @param a
     * @param b
     */
    protected abstract reinterpolatorOf(a: number, b: number): Reinterpolator<number>;

    protected clampDeinterpolatorFactory(deinterpolatorOf: DeinterpolatorFactory<number>): DeinterpolatorFactory<number> {
        return (a, b) => {
            const deinterpolate = deinterpolatorOf(a, b);
            return (x) => {
                if (x <= a) {
                    return 0.0;
                } else if (x >= b) {
                    return 1.0;
                } else {
                    return deinterpolate(x);
                }
            };
        };
    }

    protected clampReinterpolatorFactory(reinterpolatorOf: ReinterpolatorFactory<number>): ReinterpolatorFactory<number> {
        return (a, b) => {
            const reinterpolate = reinterpolatorOf(a, b);
            return (t) => {
                if (t <= 0) {
                    return a;
                } else if (t >= 1) {
                    return b;
                } else {
                    return reinterpolate(t);
                }
            };
        };
    }

    protected rescale() {
        // TODO: uncomment the polylinear functionality here and the corresponding
        //       methods below when we have a use case fot it.
        const isPoly = Math.min(this._domain.length, this._range.length) > 2;
        this.piecewiseReinterpolatorFactory = isPoly ? this.polymap : this.bimap;
        this.piecewiseDeinterpolatorFactory = isPoly ? this.polymapInvert : this.bimapInvert;

        this.piecewiseReinterpolatorFactory = this.bimap;
        this.piecewiseDeinterpolatorFactory = this.bimapInvert;
        this.piecewiseDeinterpolator = undefined;
        this.piecewiseReinterpolator = undefined;
    }

    private bimap(domain: number[], range: R[],
                  deinterpolatorOf: DeinterpolatorFactory<number>,
                  reinterpolatorOf: ReinterpolatorFactory<R>): Reinterpolator<R> {
        const d0 = domain[0];
        const d1 = domain[1];
        const r0 = range[0];
        const r1 = range[1];

        let dt: Deinterpolator<number>;
        let tr: Reinterpolator<R>;

        if (d1 < d0) {
            dt = deinterpolatorOf(d1, d0);
            tr = reinterpolatorOf(r1, r0);
        } else {
            dt = deinterpolatorOf(d0, d1);
            tr = reinterpolatorOf(r0, r1);
        }

        return (x) => tr(dt(x)); // domain value -> t -> range value
    }

    private bimapInvert(range: R[], domain: number[],
                        deinterpolatorOf: DeinterpolatorFactory<R>,
                        reinterpolatorOf: ReinterpolatorFactory<number>): Deinterpolator<R> {
        const r0 = range[0];
        const r1 = range[1];
        const d0 = domain[0];
        const d1 = domain[1];

        let rt: Deinterpolator<R>;
        let td: Reinterpolator<number>;

        if (d1 < d0) {
            rt = deinterpolatorOf(r1, r0);
            td = reinterpolatorOf(d1, d0);
        } else {
            rt = deinterpolatorOf(r0, r1);
            td = reinterpolatorOf(d0, d1);
        }

        return (x) => td(rt(x));
    }

    // TODO: not used right now, but not to be removed
    private polymap(domain: number[], range: R[],
                    deinterpolatorOf: DeinterpolatorFactory<number>,
                    reinterpolatorOf: ReinterpolatorFactory<R>): Reinterpolator<R> {

        let d: number[];
        let r: R[];

        if (domain.slice(-1)[0] < domain[0]) {
            d = domain.reverse();
            r = range.reverse();
        } else {
            d = domain;
            r = range;
        }

        // number of segments in the polylinear scale
        const n = Math.min(domain.length, range.length) - 1;
        // deinterpolators from domain segment value to t
        const dt = Array.from( {length: n}, (_, i) => deinterpolatorOf(d[i], d[i+1]) );
        // reinterpolators from t to range segment value
        const tr = Array.from( {length: n}, (_, i) => reinterpolatorOf(r[i], r[i+1]) );

        return (x) => {
            const i = bisectRight(d, x, ascending, 1, n) - 1; // Find the domain segment that `x` belongs to.
            // This also tells us which deinterpolator/reinterpolator pair to use.
            return tr[i](dt[i](x));
        };
    }

    private polymapInvert(range: R[], domain: number[],
                          deinterpolatorOf: DeinterpolatorFactory<R>,
                          reinterpolatorOf: ReinterpolatorFactory<number>): Deinterpolator<R> {
        let r: R[];
        let d: number[];

        if (domain.slice(-1)[0] < domain[0]) {
            r = range.reverse();
            d = domain.reverse();
        } else {
            r = range;
            d = domain;
        }

        const n = Math.min(domain.length, range.length) - 1;
        const rt = Array.from( {length: n}, (_, i) => deinterpolatorOf(r[i], r[i+1]) );
        const td = Array.from( {length: n}, (_, i) => reinterpolatorOf(d[i], d[i+1]) );

        return (x) => {
            if (!this.rangeComparator) {
                throw new Error('Missing rangeComparator');
            }
            const i = bisectRight(r, x, this.rangeComparator, 1, n) - 1;
            return td[i](rt[i](x));
        };
    }
}
