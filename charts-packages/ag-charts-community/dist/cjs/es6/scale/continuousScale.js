"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("../interpolate/value");
const number_1 = require("../interpolate/number");
const bisect_1 = require("../util/bisect");
const compare_1 = require("../util/compare");
const constant = (x) => () => x;
const identity = (x) => x;
function clamper(domain) {
    let a = domain[0];
    let b = domain[domain.length - 1];
    if (a > b) {
        [a, b] = [b, a];
    }
    return (x) => Math.max(a, Math.min(b, x));
}
exports.clamper = clamper;
class ContinuousScale {
    constructor() {
        /**
         * The output value of the scale for `undefined` or `NaN` input values.
         */
        this.unknown = undefined;
        this.clamper = clamper;
        this._clamp = identity;
        this._domain = [0, 1];
        this._range = [0, 1];
        this.transform = identity; // transforms domain value
        this.untransform = identity; // untransforms domain value
        this._interpolate = value_1.default;
        this.rescale();
    }
    set clamp(value) {
        this._clamp = value ? this.clamper(this.domain) : identity;
    }
    get clamp() {
        return this._clamp !== identity;
    }
    setDomain(values) {
        this._domain = values.map((v) => +v);
        if (this._clamp !== identity) {
            this._clamp = this.clamper(this.domain);
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
        this._range = values.slice();
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
        if (Math.min(this.domain.length, this.range.length) > 2) {
            this.piecewise = this.polymap;
        }
        else {
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
    normalize(a, b) {
        a = +a;
        b -= a;
        return b ? (x) => (x - a) / b : constant(isNaN(b) ? NaN : 0.5);
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
    polymap(domain, range, interpolate) {
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
            const i = bisect_1.bisectRight(domain, x, compare_1.ascending, 1, n) - 1; // Find the domain segment that `x` belongs to.
            // This also tells us which deinterpolator/reinterpolator pair to use.
            return tr[i](dt[i](x));
        };
    }
    convert(x, clamper) {
        x = +x;
        if (isNaN(x)) {
            return this.unknown;
        }
        if (!this.output) {
            this.output = this.piecewise(this.domain.map(this.transform), this.range, this.interpolate);
        }
        const clamp = clamper ? clamper(this.domain) : this._clamp;
        return this.output(this.transform(clamp(x)));
    }
    invert(y) {
        if (!this.input) {
            this.input = this.piecewise(this.range, this.domain.map(this.transform), number_1.default);
        }
        return this._clamp(this.untransform(this.input(y)));
    }
}
exports.ContinuousScale = ContinuousScale;
