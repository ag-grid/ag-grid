"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinuousScale = void 0;
class ContinuousScale {
    constructor(domain, range) {
        this.domain = domain;
        this.range = range;
        this.nice = false;
        this.tickCount = ContinuousScale.defaultTickCount;
        this.niceDomain = null;
        this.strictClampByDefault = false;
        this.cache = null;
        this.cacheProps = ['domain', 'range', 'nice', 'tickCount'];
    }
    transform(x) {
        return x;
    }
    transformInvert(x) {
        return x;
    }
    fromDomain(d) {
        if (d instanceof Date) {
            return d.getTime();
        }
        return d;
    }
    getDomain() {
        if (this.nice) {
            this.refresh();
            if (this.niceDomain) {
                return this.niceDomain;
            }
        }
        return this.domain;
    }
    convert(x, params) {
        var _a;
        if (!this.domain || this.domain.length < 2) {
            return NaN;
        }
        this.refresh();
        const strict = (_a = params === null || params === void 0 ? void 0 : params.strict) !== null && _a !== void 0 ? _a : this.strictClampByDefault;
        const domain = this.getDomain().map((d) => this.transform(d));
        const [d0, d1] = domain;
        const { range } = this;
        const [r0, r1] = range;
        x = this.transform(x);
        if (x < d0) {
            return strict ? NaN : r0;
        }
        else if (x > d1) {
            return strict ? NaN : r1;
        }
        if (d0 === d1) {
            return (r0 + r1) / 2;
        }
        else if (x === d0) {
            return r0;
        }
        else if (x === d1) {
            return r1;
        }
        return (r0 + ((this.fromDomain(x) - this.fromDomain(d0)) / (this.fromDomain(d1) - this.fromDomain(d0))) * (r1 - r0));
    }
    invert(x) {
        this.refresh();
        const domain = this.getDomain().map((d) => this.transform(d));
        const [d0, d1] = domain;
        const { range } = this;
        const [r0, r1] = range;
        let d;
        if (x < r0) {
            d = d0;
        }
        else if (x > r1) {
            d = d1;
        }
        else if (r0 === r1) {
            d = this.toDomain((this.fromDomain(d0) + this.fromDomain(d1)) / 2);
        }
        else if (x === r0) {
            d = d0;
        }
        else if (x === r1) {
            d = d1;
        }
        else {
            d = this.toDomain(this.fromDomain(d0) + ((x - r0) / (r1 - r0)) * (this.fromDomain(d1) - this.fromDomain(d0)));
        }
        return this.transformInvert(d);
    }
    didChange() {
        const { cache } = this;
        const didChange = !cache || this.cacheProps.some((p) => this[p] !== cache[p]);
        if (didChange) {
            this.cache = {};
            this.cacheProps.forEach((p) => (this.cache[p] = this[p]));
            return true;
        }
        return false;
    }
    refresh() {
        if (this.didChange()) {
            this.update();
        }
    }
    isDenseInterval({ start, stop, interval, count, }) {
        const { range } = this;
        const domain = stop - start;
        const min = Math.min(range[0], range[1]);
        const max = Math.max(range[0], range[1]);
        const availableRange = max - min;
        const step = typeof interval === 'number' ? interval : 1;
        count !== null && count !== void 0 ? count : (count = domain / step);
        if (count >= availableRange) {
            console.warn(`AG Charts - the configured tick interval, ${JSON.stringify(interval)}, results in more than 1 tick per pixel, ignoring. Supply a larger tick interval or omit this configuration.`);
            return true;
        }
        return false;
    }
}
exports.ContinuousScale = ContinuousScale;
ContinuousScale.defaultTickCount = 5;
