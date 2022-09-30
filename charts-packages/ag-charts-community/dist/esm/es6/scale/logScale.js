var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ContinuousScale } from './continuousScale';
import ticks from '../util/ticks';
import { format } from '../util/numberFormat';
import { NUMBER, Validate } from '../util/validation';
const identity = (x) => x;
export class LogScale extends ContinuousScale {
    constructor() {
        super(...arguments);
        this.type = 'log';
        this._domain = [1, 10];
        this.baseLog = identity; // takes a log with base `base` of `x`
        this.basePow = identity; // raises `base` to the power of `x`
        this._base = 10;
    }
    setDomain(values) {
        let df = values[0];
        let dl = values[values.length - 1];
        if (df === 0 || dl === 0 || (df < 0 && dl > 0) || (df > 0 && dl < 0)) {
            console.warn('Log scale domain should not start at, end at or cross zero.');
            if (df === 0 && dl > 0) {
                df = Number.EPSILON;
            }
            else if (dl === 0 && df < 0) {
                dl = -Number.EPSILON;
            }
            else if (df < 0 && dl > 0) {
                if (Math.abs(dl) >= Math.abs(df)) {
                    df = Number.EPSILON;
                }
                else {
                    dl = -Number.EPSILON;
                }
            }
            else if (df > 0 && dl < 0) {
                if (Math.abs(dl) >= Math.abs(df)) {
                    df = -Number.EPSILON;
                }
                else {
                    dl = Number.EPSILON;
                }
            }
            values = values.slice();
            values[0] = df;
            values[values.length - 1] = dl;
        }
        super.setDomain(values);
    }
    getDomain() {
        return super.getDomain();
    }
    set base(value) {
        if (this._base !== value) {
            this._base = value;
            this.rescale();
        }
    }
    get base() {
        return this._base;
    }
    rescale() {
        const { base } = this;
        let baseLog = LogScale.makeLogFn(base);
        let basePow = LogScale.makePowFn(base);
        if (this.domain[0] < 0) {
            baseLog = this.reflect(baseLog);
            basePow = this.reflect(basePow);
            this.transform = (x) => -Math.log(-x);
            this.untransform = (x) => -Math.exp(-x);
        }
        else {
            this.transform = (x) => Math.log(x);
            this.untransform = (x) => Math.exp(x);
        }
        this.baseLog = baseLog;
        this.basePow = basePow;
        super.rescale();
    }
    /**
     * For example, if `f` is `Math.log10`, we have
     *
     *     f(100) == 2
     *     f(-100) == NaN
     *     rf = reflect(f)
     *     rf(-100) == -2
     *
     * @param f
     */
    reflect(f) {
        return (x) => -f(-x);
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
        domain[i0] = this.basePow(Math.floor(this.baseLog(x0)));
        domain[i1] = this.basePow(Math.ceil(this.baseLog(x1)));
        this.domain = domain;
    }
    static pow10(x) {
        return isFinite(x)
            ? +('1e' + x) // to avoid precision issues, e.g. Math.pow(10, -4) is not 0.0001
            : x < 0
                ? 0
                : x;
    }
    static makePowFn(base) {
        if (base === 10) {
            return LogScale.pow10;
        }
        if (base === Math.E) {
            return Math.exp;
        }
        return (x) => Math.pow(base, x);
    }
    // Make a log function witn an arbitrary base or return a native function if exists.
    static makeLogFn(base) {
        if (base === Math.E) {
            return Math.log;
        }
        if (base === 10) {
            return Math.log10;
        }
        if (base === 2) {
            return Math.log2;
        }
        const logBase = Math.log(base);
        return (x) => Math.log(x) / logBase;
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
        let p0 = this.baseLog(d0);
        let p1 = this.baseLog(d1);
        let z = [];
        // if `base` is an integer and delta in order of magnitudes is less than n
        if (!(base % 1) && p1 - p0 < n) {
            // For example, if n == 10, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < n == true.
            p0 = Math.round(p0) - 1;
            p1 = Math.round(p1) + 1;
            if (d0 > 0) {
                for (; p0 < p1; ++p0) {
                    for (let k = 1, p = this.basePow(p0); k < base; ++k) {
                        let t = p * k;
                        // The `t` checks are needed because we expanded the [p0, p1] by 1 in each direction.
                        if (t < d0)
                            continue;
                        if (t > d1)
                            break;
                        z.push(t);
                    }
                }
            }
            else {
                for (; p0 < p1; ++p0) {
                    for (let k = base - 1, p = this.basePow(p0); k >= 1; --k) {
                        let t = p * k;
                        if (t < d0)
                            continue;
                        if (t > d1)
                            break;
                        z.push(t);
                    }
                }
            }
            if (z.length * 2 < n) {
                z = ticks(d0, d1, n);
            }
        }
        else {
            // For example, if n == 4, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < n == false.
            // `ticks` return [2, 3, 4, 5, 6], then mapped to [10^2, 10^3, 10^4, 10^5, 10^6].
            z = ticks(p0, p1, Math.min(p1 - p0, n)).map(this.basePow);
        }
        return isReversed ? z.reverse() : z;
    }
    tickFormat({ count, specifier, }) {
        const { base } = this;
        if (specifier == null) {
            specifier = (base === 10 ? '.0e' : ',');
        }
        if (typeof specifier !== 'function') {
            specifier = format(specifier);
        }
        if (count === Infinity) {
            return specifier;
        }
        if (count == null) {
            count = 10;
        }
        const k = Math.max(1, (base * count) / this.ticks().length);
        return (d) => {
            let i = d / this.basePow(Math.round(this.baseLog(d)));
            if (i * base < base - 0.5) {
                i *= base;
            }
            return i <= k ? specifier(d) : '';
        };
    }
}
__decorate([
    Validate(NUMBER(0))
], LogScale.prototype, "_base", void 0);
