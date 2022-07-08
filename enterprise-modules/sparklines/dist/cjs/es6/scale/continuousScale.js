"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("../interpolate/value");
const number_1 = require("../interpolate/number");
exports.constant = (x) => () => x;
exports.identity = (x) => x;
function clamper(domain) {
    let a = domain[0];
    let b = domain[domain.length - 1];
    if (a > b) {
        [a, b] = [b, a];
    }
    return x => Math.max(a, Math.min(b, x));
}
class ContinuousScale {
    constructor() {
        /**
         * The output value of the scale for `undefined` or `NaN` input values.
         */
        this.unknown = undefined;
        this._clamp = exports.identity;
        this._domain = [0, 1];
        this._range = [0, 1];
        this.transform = exports.identity; // transforms domain value
        this.untransform = exports.identity; // untransforms domain value
        this._interpolate = value_1.default;
        this.rescale();
    }
    set clamp(value) {
        this._clamp = value ? clamper(this.domain) : exports.identity;
    }
    get clamp() {
        return this._clamp !== exports.identity;
    }
    setDomain(values) {
        this._domain = Array.prototype.map.call(values, (v) => +v);
        if (this._clamp !== exports.identity) {
            this._clamp = clamper(this.domain);
        }
        this.rescale();
    }
    getDomain() {
        return this._domain.slice();
    }
    set domain(values) {
        this.setDomain(values);
    }
    get domain() {
        return this.getDomain();
    }
    set range(values) {
        this._range = Array.prototype.slice.call(values);
        this.rescale();
    }
    get range() {
        return this._range.slice();
    }
    set interpolate(value) {
        this._interpolate = value;
        this.rescale();
    }
    get interpolate() {
        return this._interpolate;
    }
    rescale() {
        this.piecewise = this.bimap;
        this.output = undefined;
        this.input = undefined;
    }
    /**
     * Returns a function that converts `x` in `[a, b]` to `t` in `[0, 1]`. Non-clamping.
     * @param a
     * @param b
     */
    normalize(a, b) {
        return (b -= (a = +a))
            ? (x) => (x - a) / b
            : exports.constant(isNaN(b) ? NaN : 0.5);
    }
    bimap(domain, range, interpolate) {
        const x0 = domain[0];
        const x1 = domain[1];
        const y0 = range[0];
        const y1 = range[1];
        let xt;
        let ty;
        if (x1 < x0) {
            xt = this.normalize(x1, x0);
            ty = interpolate(y1, y0);
        }
        else {
            xt = this.normalize(x0, x1);
            ty = interpolate(y0, y1);
        }
        return (x) => ty(xt(x)); // domain value x --> t in [0, 1] --> range value y
    }
    convert(x) {
        x = +x;
        if (isNaN(x)) {
            return this.unknown;
        }
        else {
            if (!this.output) {
                this.output = this.piecewise(this.domain.map(this.transform), this.range, this.interpolate);
            }
            return this.output(this.transform(this._clamp(x)));
        }
    }
    invert(y) {
        if (!this.input) {
            this.input = this.piecewise(this.range, this.domain.map(this.transform), number_1.default);
        }
        return this._clamp(this.untransform(this.input(y)));
    }
}
exports.default = ContinuousScale;
