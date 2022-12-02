import interpolateValue from "../interpolate/value";
import interpolateNumber from "../interpolate/number";
import Scale, {
    Deinterpolator,
    Reinterpolator
} from './scale';

const constant = (x: any) => () => x;
const identity = (x: any) => x;

function clamper(domain: number[]): (x: number) => number {
    let a = domain[0];
    let b = domain[domain.length - 1];

    if (a > b) {
        [a, b] = [b, a];
    }

    return x => Math.max(a, Math.min(b, x));
}

export default abstract class ContinuousScale implements Scale<any, any> {
    /**
     * The output value of the scale for `undefined` or `NaN` input values.
     */
    unknown: any = undefined;

    constructor() {
        this.rescale();
    }

    protected _clamp = identity;
    set clamp(value: boolean) {
        this._clamp = value ? clamper(this.domain) : identity;
    }
    get clamp(): boolean {
        return this._clamp !== identity;
    }

    protected _domain: any[] = [0, 1];
    protected setDomain(values: any[]) {
        this._domain = Array.prototype.map.call(values, (v: any) => +v);
        if (this._clamp !== identity) {
            this._clamp = clamper(this.domain);
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
        this._range = Array.prototype.slice.call(values);
        this.rescale();
    }
    get range(): any[] {
        return this._range.slice();
    }

    private input?: (y: any) => any;   // y -> x
    private output?: (x: any) => any;  // x -> y
    private piecewise?: (domain: any[], range: any[], interpolate: (a: any, b: any) => (t: number) => any) => (x: any) => any;

    protected transform: (x: any) => any = identity;   // transforms domain value
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
        this.piecewise = this.bimap;
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

    convert(x: any): any {
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

    invert(y: any): any {
        if (!this.input) {
            this.input = this.piecewise!(this.range, this.domain.map(this.transform), interpolateNumber);
        }
        return this._clamp(this.untransform(this.input(y)));
    }
}
