import { ContinuousScale } from './continuousScale';
import ticks from '../util/ticks';
import { format } from '../util/numberFormat';
import { NUMBER, Validate } from '../util/validation';

const identity = (x: any) => x;

export class LogScale extends ContinuousScale {
    readonly type = 'log';

    domain = [1, 10];

    @Validate(NUMBER(0))
    base = 10;

    protected transform(x: any) {
        return this.domain[0] >= 0 ? Math.log(x) : -Math.log(-x);
    }
    protected transformInvert(x: any) {
        return this.domain[0] >= 0 ? Math.exp(x) : -Math.exp(-x);
    }

    protected cacheProps: Array<keyof this> = ['domain', 'range', 'nice', 'tickCount', 'base'];

    update() {
        if (!this.domain || this.domain.length < 2) {
            return;
        }
        this.updateLogFn();
        this.updatePowFn();
        if (this.nice) {
            this.updateNiceDomain();
        }
    }

    private baseLog: (x: number) => number = identity;
    private basePow: (x: number) => number = identity;

    private log = (x: number) => {
        return this.domain[0] >= 0 ? this.baseLog(x) : -this.baseLog(-x);
    };

    private pow = (x: number) => {
        return this.domain[0] >= 0 ? this.basePow(x) : -this.basePow(-x);
    };

    private updateLogFn() {
        const { base } = this;
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
        const { base } = this;
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

    protected updateNiceDomain() {
        const [d0, d1] = this.domain;

        const n0 = this.pow(Math.floor(this.log(d0)));
        const n1 = this.pow(Math.ceil(this.log(d1)));
        this.niceDomain = [n0, n1];
    }

    static pow10(x: number): number {
        return x >= 0 ? Math.pow(10, x) : 1 / Math.pow(10, -x);
    }

    ticks() {
        if (!this.domain || this.domain.length < 2) {
            return [];
        }
        this.refresh();
        const n = this.tickCount ?? 10;
        const base = this.base;
        const [d0, d1] = this.getDomain();

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

        return z;
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
