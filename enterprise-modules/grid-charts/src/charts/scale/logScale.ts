import ContinuousScale, { identity } from "./continuousScale";
import ticks from "../util/ticks";

export class LogScale extends ContinuousScale {
    protected _domain: any[] = [1, 10];

    baseLog: (x: number) => number = identity; // takes a log with base `base` of `x`
    basePow: (x: number) => number = identity; // raises `base` to the power of `x`

    private _base: number = 10;
    set base(value: number) {
        if (this._base !== value) {
            this._base = value;
            this.rescale();
        }
    }
    get base(): number {
        return this._base;
    }

    protected rescale() {
        let baseLog = this.makeLogFn(this.base);
        let basePow = this.makePowFn(this.base);

        if (this.domain[0] < 0) {
            baseLog = this.reflect(baseLog);
            basePow = this.reflect(basePow);
            this.transform = (x: number) => -Math.log(-x);
            this.untransform = (x: number) => -Math.exp(-x);
        } else {
            this.transform = (x: number) => Math.log(x);
            this.untransform = (x: number) => Math.exp(x);
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
    reflect(f: (x: number) => number): (x: number) => number {
        return x => -f(-x);
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

    private pow10(x: number): number {
        return isFinite(x)
            ? +('1e' + x) // to avoid precision issues, e.g. Math.pow(10, -4) is not 0.0001
            : x < 0
                ? 0
                : x;
    }

    private makePowFn(base: number): (x: number) => number {
        if (base === 10) {
            return this.pow10;
        }
        if (base === Math.E) {
            return Math.exp;
        }
        return x => Math.pow(base, x);
    }

    private makeLogFn(base: number): (x: number) => number {
        if (base === Math.E) {
            return Math.log;
        }
        if (base === 10 && Math.log10) {
            return Math.log10;
        }
        if (base === 2 && Math.log2) {
            return Math.log2;
        }
        base = Math.log(base);
        return x => Math.log(x) / base;
    }

    ticks(count: number = 10): number[] {
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
        let z: number[] = [];

        // if `base` is an integer and delta in order of magnitudes is less than count
        if (!(base % 1) && p1 - p0 < count) {
            // For example, if count == 10, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < count == true.
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
            } else {
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
        } else {
            // For example, if count == 4, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < count == false.
            // `ticks` return [2, 3, 4, 5, 6], then mapped to [10^2, 10^3, 10^4, 10^5, 10^6].
            z = ticks(p0, p1, Math.min(p1 - p0, count)).map(this.basePow);
        }

        return isReversed ? z.reverse() : z;
    }
}
