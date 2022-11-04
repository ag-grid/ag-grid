import interpolateValue from '../interpolate/value';
import interpolateNumber from '../interpolate/number';
import { Scale, Deinterpolator, Reinterpolator } from './scale';
import { bisectRight } from '../util/bisect';
import { ascending } from '../util/compare';

const constant = (x: any) => () => x;
const identity = (x: any) => x;

export function clamper(domain: number[]): (x: number) => number {
    let a = domain[0];
    let b = domain[domain.length - 1];

    if (a > b) {
        [a, b] = [b, a];
    }

    return (x) => Math.max(a, Math.min(b, x));
}

// Instead of clamping the values outside of domain to the range,
// return NaNs to indicate invalid input.
export function filter(domain: number[]): (x: number) => number {
    let a = domain[0];
    let b = domain[domain.length - 1];

    if (a > b) {
        [a, b] = [b, a];
    }

    return (x) => (x >= a && x <= b ? x : NaN);
}

export abstract class ContinuousScale implements Scale<any, any> {
    /**
     * The output value of the scale for `undefined` or `NaN` input values.
     */
    unknown: any = undefined;

    constructor() {
        this.rescale();
    }

    clamper = clamper;

    protected _clamp = identity;
    set clamp(value: boolean) {
        this._clamp = value ? this.clamper(this.domain) : identity;
    }
    get clamp(): boolean {
        return this._clamp !== identity;
    }

    protected _domain: any[] = [0, 1];
    protected setDomain(values: any[]) {
        this._domain = values.map((v) => +v);
        if (this._clamp !== identity) {
            this._clamp = this.clamper(this.domain);
        }
        this.rescale();
    }
    protected getDomain(): any[] {
        return this._domain.slice();
    }
    set domain(values: any[]) {
        this.setDomain(values);
    }
    get domain(): any[] {
        return this.getDomain();
    }

    protected _range: any[] = [0, 1];
    set range(values: any[]) {
        this._range = values.slice();
        this.rescale();
    }
    get range(): any[] {
        return this._range.slice();
    }

    private input?: (y: any) => any; // y -> x
    private output?: (x: any) => any; // x -> y
    private piecewise?: (
        domain: any[],
        range: any[],
        interpolate: (a: any, b: any) => (t: number) => any
    ) => (x: any) => any;

    protected transform: (x: any) => any = identity; // transforms domain value
    protected untransform: (x: any) => any = identity; // untransforms domain value

    private _interpolate: (a: any, b: any) => (t: any) => any = interpolateValue;
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
        a = +a;
        b -= a;
        return b ? (x: any) => (x - a) / b : constant(isNaN(b) ? NaN : 0.5);
    }

    private bimap(domain: any[], range: any[], interpolate: (a: any, b: any) => (t: number) => any): (x: any) => any {
        const x0 = domain[0];
        const x1 = domain[1];
        const y0 = range[0];
        const y1 = range[1];

        let xt: Deinterpolator<any>;
        let ty: Reinterpolator<any>;

        if (x1 < x0) {
            xt = this.normalize(x1, x0);
            ty = interpolate(y1, y0);
        } else {
            xt = this.normalize(x0, x1);
            ty = interpolate(y0, y1);
        }

        return (x) => ty(xt(x)); // domain value x --> t in [0, 1] --> range value y
    }

    private polymap(
        domain: any[],
        range: any[],
        interpolate: (a: any, b: any) => (t: number) => any
    ): Reinterpolator<any> {
        // number of segments in the polylinear scale
        const n = Math.min(domain.length, range.length) - 1;

        if (domain[n] < domain[0]) {
            domain = domain.slice().reverse();
            range = range.slice().reverse();
        }

        // deinterpolators from domain segment value to t
        const dt = Array.from({ length: n }, (_, i) => this.normalize(domain[i], domain[i + 1]));
        // reinterpolators from t to range segment value
        const tr = Array.from({ length: n }, (_, i) => interpolate(range[i], range[i + 1]));

        return (x) => {
            const i = bisectRight(domain, x, ascending, 1, n) - 1; // Find the domain segment that `x` belongs to.
            // This also tells us which deinterpolator/reinterpolator pair to use.
            return tr[i](dt[i](x));
        };
    }

    convert(x: any, clamper?: (values: number[]) => (x: number) => number): any {
        x = +x;
        if (isNaN(x)) {
            return this.unknown;
        }
        if (!this.output) {
            this.output = this.piecewise!(this.domain.map(this.transform), this.range, this.interpolate);
        }
        const clamp = clamper ? clamper(this.domain) : this._clamp;
        return this.output(this.transform(clamp(x)));
    }

    invert(y: any): any {
        if (!this.input) {
            this.input = this.piecewise!(this.range, this.domain.map(this.transform), interpolateNumber);
        }
        return this._clamp(this.untransform(this.input(y)));
    }
}
