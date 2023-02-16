var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ContinuousScale } from './continuousScale';
import generateTicks, { range } from '../util/ticks';
import { format } from '../util/numberFormat';
import { NUMBER, Validate } from '../util/validation';
const identity = (x) => x;
export class LogScale extends ContinuousScale {
    constructor() {
        super([1, 10], [0, 1]);
        this.type = 'log';
        this.base = 10;
        this.cacheProps = ['domain', 'range', 'nice', 'tickCount', 'base'];
        this.baseLog = identity;
        this.basePow = identity;
        this.log = (x) => {
            return this.domain[0] >= 0 ? this.baseLog(x) : -this.baseLog(-x);
        };
        this.pow = (x) => {
            return this.domain[0] >= 0 ? this.basePow(x) : -this.basePow(-x);
        };
    }
    toDomain(d) {
        return d;
    }
    transform(x) {
        return this.domain[0] >= 0 ? Math.log(x) : -Math.log(-x);
    }
    transformInvert(x) {
        return this.domain[0] >= 0 ? Math.exp(x) : -Math.exp(-x);
    }
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
    updateLogFn() {
        const { base } = this;
        let log;
        if (base === 10) {
            log = Math.log10;
        }
        else if (base === Math.E) {
            log = Math.log;
        }
        else if (base === 2) {
            log = Math.log2;
        }
        else {
            const logBase = Math.log(base);
            log = (x) => Math.log(x) / logBase;
        }
        this.baseLog = log;
    }
    updatePowFn() {
        const { base } = this;
        let pow;
        if (base === 10) {
            pow = LogScale.pow10;
        }
        else if (base === Math.E) {
            pow = Math.exp;
        }
        else {
            pow = (x) => Math.pow(base, x);
        }
        this.basePow = pow;
    }
    updateNiceDomain() {
        const [d0, d1] = this.domain;
        const n0 = this.pow(Math.floor(this.log(d0)));
        const n1 = this.pow(Math.ceil(this.log(d1)));
        this.niceDomain = [n0, n1];
    }
    static pow10(x) {
        return x >= 0 ? Math.pow(10, x) : 1 / Math.pow(10, -x);
    }
    ticks() {
        var _a;
        const count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : 10;
        if (!this.domain || this.domain.length < 2 || count < 1) {
            return [];
        }
        this.refresh();
        const base = this.base;
        const [d0, d1] = this.getDomain();
        let p0 = this.log(d0);
        let p1 = this.log(d1);
        if (this.interval) {
            const step = Math.abs(this.interval);
            const absDiff = Math.abs(p1 - p0);
            const ticks = range(p0, p1, Math.min(absDiff, step))
                .map((x) => this.pow(x))
                .filter((t) => t >= d0 && t <= d1);
            if (!this.isDenseInterval({ start: d0, stop: d1, interval: step, count: ticks.length })) {
                return ticks;
            }
        }
        const isBaseInteger = base % 1 === 0;
        const isDiffLarge = p1 - p0 >= count;
        if (!isBaseInteger || isDiffLarge) {
            // Returns [10^1, 10^2, 10^3, 10^4, ...]
            return generateTicks(p0, p1, Math.min(p1 - p0, count)).map((x) => this.pow(x));
        }
        const ticks = [];
        const isPositive = d0 > 0;
        p0 = Math.floor(p0) - 1;
        p1 = Math.round(p1) + 1;
        for (let p = p0; p <= p1; p++) {
            for (let k = 1; k < base; k++) {
                const q = isPositive ? k : base - k + 1;
                const t = this.pow(p) * q;
                if (t >= d0 && t <= d1) {
                    ticks.push(t);
                }
            }
        }
        return ticks;
    }
    tickFormat({ count, ticks, specifier, }) {
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
        ticks = ticks !== null && ticks !== void 0 ? ticks : this.ticks();
        const k = Math.max(1, (base * count) / ticks.length);
        return (d) => {
            let i = d / this.pow(Math.round(this.log(d)));
            if (i * base < base - 0.5) {
                i *= base;
            }
            return i <= k ? specifier(d) : '';
        };
    }
}
__decorate([
    Validate(NUMBER(0))
], LogScale.prototype, "base", void 0);
