import { ContinuousScale } from './continuousScale';
import ticks from '../util/ticks';
import { format } from '../util/numberFormat';
import { NUMBER, Validate } from '../util/validation';

const identity = (x: any) => x;

export class LogScale extends ContinuousScale {
    readonly type = 'log';

    constructor() {
        super();
        this.updateLogFn();
        this.updatePowFn();
    }

    protected _domain = [1, 10];
    set domain(values: any[]) {
        this._domain = values;
    }
    get domain() {
        return this._domain;
    }

    protected transform(x: any) {
        return this._domain[0] >= 0 ? Math.log(x) : -Math.log(-x);
    }
    protected transformInvert(x: any) {
        return this._domain[0] >= 0 ? Math.exp(x) : -Math.exp(-x);
    }

    @Validate(NUMBER(0))
    private _base = 10;
    set base(value: number) {
        if (this._base === value) {
            return;
        }
        this._base = value;
        this.updateLogFn();
        this.updatePowFn();
    }
    get base(): number {
        return this._base;
    }

    private baseLog: (x: number) => number = identity;
    private basePow: (x: number) => number = identity;

    private log = (x: number) => {
        return this._domain[0] >= 0 ? this.baseLog(x) : -this.baseLog(-x);
    };

    private pow = (x: number) => {
        return this._domain[0] >= 0 ? this.basePow(x) : -this.basePow(-x);
    };

    private updateLogFn() {
        const base = this._base;
        let log: (x: number) => number;
        if (base === 10) {
            log = Math.log10;
        } else if (base === Math.E) {
            log = Math.log;
        } else if (base === 2) {
            log = Math.log2;
        } else {
            const logBase = Math.log(base);
            log = (x) => Math.log(x) / logBase;
        }
        this.baseLog = log;
    }

    private updatePowFn() {
        const base = this._base;
        let pow: (x: number) => number;
        if (base === 10) {
            pow = LogScale.pow10;
        } else if (base === Math.E) {
            pow = Math.exp;
        } else {
            pow = (x) => Math.pow(base, x);
        }
        this.basePow = pow;
    }

    nice() {
        const domain = this.domain;
        let i0 = 0;
        let i1 = domain.length - 1;
        let x0 = domain[i0];
        let x1 = domain[i1];

        if (x1 < x0) {
            [i0, i1] = [i1, i0];
            [x0, x1] = [x1, x0];
        }

        // For example, for base == 10:
        // [ 50, 900] becomes [ 10, 1000 ]
        domain[i0] = this.pow(Math.floor(this.log(x0)));
        domain[i1] = this.pow(Math.ceil(this.log(x1)));

        this.domain = domain;
    }

    static pow10(x: number): number {
        return isFinite(x)
            ? +('1e' + x) // to avoid precision issues, e.g. Math.pow(10, -4) is not 0.0001
            : x < 0
            ? 0
            : x;
    }

    ticks(count = 10) {
        const n = count == null ? 10 : +count;
        const base = this.base;
        const domain = this.domain;
        let d0 = domain[0];
        let d1 = domain[domain.length - 1];
        const isReversed = d1 < d0;

        if (isReversed) {
            [d0, d1] = [d1, d0];
        }

        let p0 = this.log(d0);
        let p1 = this.log(d1);
        let z = [];

        // if `base` is an integer and delta in order of magnitudes is less than n
        if (!(base % 1) && p1 - p0 < n) {
            // For example, if n == 10, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < n == true.
            p0 = Math.round(p0) - 1;
            p1 = Math.round(p1) + 1;
            if (d0 > 0) {
                for (; p0 < p1; ++p0) {
                    for (let k = 1, p = this.pow(p0); k < base; ++k) {
                        let t = p * k;
                        // The `t` checks are needed because we expanded the [p0, p1] by 1 in each direction.
                        if (t < d0) continue;
                        if (t > d1) break;
                        z.push(t);
                    }
                }
            } else {
                for (; p0 < p1; ++p0) {
                    for (let k = base - 1, p = this.pow(p0); k >= 1; --k) {
                        let t = p * k;
                        if (t < d0) continue;
                        if (t > d1) break;
                        z.push(t);
                    }
                }
            }
            if (z.length * 2 < n) {
                z = ticks(d0, d1, n);
            }
        } else {
            // For example, if n == 4, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < n == false.
            // `ticks` return [2, 3, 4, 5, 6], then mapped to [10^2, 10^3, 10^4, 10^5, 10^6].
            z = ticks(p0, p1, Math.min(p1 - p0, n)).map(this.pow);
        }

        return isReversed ? z.reverse() : z;
    }

    tickFormat({
        count,
        specifier,
    }: {
        count?: any;
        ticks?: any[];
        specifier?: string | ((x: number) => string);
    }): (x: number) => string {
        const { base } = this;

        if (specifier == null) {
            specifier = (base === 10 ? '.0e' : ',') as any;
        }

        if (typeof specifier !== 'function') {
            specifier = format(specifier as string);
        }

        if (count === Infinity) {
            return specifier;
        }

        if (count == null) {
            count = 10;
        }

        const k = Math.max(1, (base * count) / this.ticks().length);

        return (d) => {
            let i = d / this.pow(Math.round(this.log(d)));
            if (i * base < base - 0.5) {
                i *= base;
            }
            return i <= k ? (specifier as (x: number) => string)(d) : '';
        };
    }
}
