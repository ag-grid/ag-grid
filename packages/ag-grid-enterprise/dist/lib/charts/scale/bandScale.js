// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Maps a discrete domain to a continuous numeric range.
 * See https://github.com/d3/d3-scale#band-scales for more info.
 */
var BandScale = /** @class */ (function () {
    function BandScale() {
        /**
         * Maps datum to its index in the {@link domain} array.
         * Used to check for duplicate datums (not allowed).
         */
        this.index = new Map();
        /**
         * The output range values for datum at each index.
         */
        this.ordinalRange = [];
        /**
         * Contains unique datums only. Since `{}` is used in place of `Map`
         * for IE11 compatibility, the datums are converted `toString` before
         * the uniqueness check.
         */
        this._domain = [];
        this._range = [0, 1];
        this._bandwidth = 1;
        /**
         * The ratio of the range that is reserved for space between bands.
         */
        this._paddingInner = 0;
        /**
         * The ratio of the range that is reserved for space before the first
         * and after the last band.
         */
        this._paddingOuter = 0;
        this._round = false;
        /**
         * How the leftover range is distributed.
         * `0.5` - equal distribution of space before the first and after the last band,
         * with bands effectively centered within the range.
         */
        this._align = 0.5;
    }
    Object.defineProperty(BandScale.prototype, "domain", {
        get: function () {
            return this._domain;
        },
        set: function (values) {
            var domain = this._domain;
            domain.length = 0;
            this.index = new Map();
            var index = this.index;
            // In case one wants to have duplicate domain values, for example, two 'Italy' categories,
            // one should use objects rather than strings for domain values like so:
            // { toString: () => 'Italy' }
            // { toString: () => 'Italy' }
            values.forEach(function (value) {
                if (index.get(value) === undefined) {
                    index.set(value, domain.push(value) - 1);
                }
            });
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "range", {
        get: function () {
            return this._range;
        },
        set: function (values) {
            this._range[0] = values[0];
            this._range[1] = values[1];
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    BandScale.prototype.ticks = function () {
        return this._domain;
    };
    BandScale.prototype.convert = function (d) {
        var i = this.index.get(d);
        if (i === undefined) {
            return NaN;
        }
        var r = this.ordinalRange[i];
        if (r === undefined) {
            return NaN;
        }
        return r;
    };
    Object.defineProperty(BandScale.prototype, "bandwidth", {
        get: function () {
            return this._bandwidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "padding", {
        get: function () {
            return this._paddingInner;
        },
        set: function (value) {
            value = Math.max(0, Math.min(1, value));
            this._paddingInner = value;
            this._paddingOuter = value;
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "paddingInner", {
        get: function () {
            return this._paddingInner;
        },
        set: function (value) {
            this._paddingInner = Math.max(0, Math.min(1, value)); // [0, 1]
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "paddingOuter", {
        get: function () {
            return this._paddingOuter;
        },
        set: function (value) {
            this._paddingOuter = Math.max(0, Math.min(1, value)); // [0, 1]
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "round", {
        get: function () {
            return this._round;
        },
        set: function (value) {
            this._round = value;
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "align", {
        get: function () {
            return this._align;
        },
        set: function (value) {
            this._align = Math.max(0, Math.min(1, value)); // [0, 1]
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    BandScale.prototype.rescale = function () {
        var _a;
        var n = this._domain.length;
        if (!n) {
            return;
        }
        var _b = this._range, a = _b[0], b = _b[1];
        var reversed = b < a;
        if (reversed) {
            _a = [b, a], a = _a[0], b = _a[1];
        }
        var step = (b - a) / Math.max(1, n - this._paddingInner + this._paddingOuter * 2);
        if (this._round) {
            step = Math.floor(step);
        }
        a += (b - a - step * (n - this._paddingInner)) * this._align;
        this._bandwidth = step * (1 - this._paddingInner);
        if (this._round) {
            a = Math.round(a);
            this._bandwidth = Math.round(this._bandwidth);
        }
        var values = [];
        for (var i = 0; i < n; i++) {
            values.push(a + step * i);
        }
        this.ordinalRange = reversed ? values.reverse() : values;
    };
    return BandScale;
}());
exports.BandScale = BandScale;
