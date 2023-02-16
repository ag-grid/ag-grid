"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BandScale = void 0;
function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}
/**
 * Maps a discrete domain to a continuous numeric range.
 */
var BandScale = /** @class */ (function () {
    function BandScale() {
        this.type = 'band';
        this.cache = null;
        this.cacheProps = ['_domain', 'range', '_paddingInner', '_paddingOuter', 'round', 'interval'];
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
        this.range = [0, 1];
        this._bandwidth = 1;
        this._rawBandwidth = 1;
        /**
         * The ratio of the range that is reserved for space between bands.
         */
        this._paddingInner = 0;
        /**
         * The ratio of the range that is reserved for space before the first
         * and after the last band.
         */
        this._paddingOuter = 0;
        this.round = false;
    }
    BandScale.prototype.didChange = function () {
        var _this = this;
        var cache = this.cache;
        var didChange = !cache || this.cacheProps.some(function (p) { return _this[p] !== cache[p]; });
        if (didChange) {
            this.cache = {};
            this.cacheProps.forEach(function (p) { return (_this.cache[p] = _this[p]); });
            return true;
        }
        return false;
    };
    BandScale.prototype.refresh = function () {
        if (this.didChange()) {
            this.update();
        }
    };
    Object.defineProperty(BandScale.prototype, "domain", {
        get: function () {
            return this._domain;
        },
        set: function (values) {
            var domain = [];
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
            this._domain = domain;
        },
        enumerable: false,
        configurable: true
    });
    BandScale.prototype.ticks = function () {
        this.refresh();
        var _a = this.interval, interval = _a === void 0 ? 1 : _a;
        var step = Math.abs(Math.round(interval));
        return this._domain.filter(function (_, i) { return i % step === 0; });
    };
    BandScale.prototype.convert = function (d) {
        this.refresh();
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
            this.refresh();
            return this._bandwidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "rawBandwidth", {
        get: function () {
            this.refresh();
            return this._rawBandwidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "padding", {
        get: function () {
            return this._paddingInner;
        },
        set: function (value) {
            value = clamp(value, 0, 1);
            this._paddingInner = value;
            this._paddingOuter = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "paddingInner", {
        get: function () {
            return this._paddingInner;
        },
        set: function (value) {
            this._paddingInner = clamp(value, 0, 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "paddingOuter", {
        get: function () {
            return this._paddingOuter;
        },
        set: function (value) {
            this._paddingOuter = clamp(value, 0, 1);
        },
        enumerable: false,
        configurable: true
    });
    BandScale.prototype.update = function () {
        var count = this._domain.length;
        if (count === 0) {
            return;
        }
        var round = this.round;
        var paddingInner = this._paddingInner;
        var paddingOuter = this._paddingOuter;
        var _a = __read(this.range, 2), r0 = _a[0], r1 = _a[1];
        var width = r1 - r0;
        var rawStep = width / Math.max(1, count + 2 * paddingOuter - paddingInner);
        var step = round ? Math.floor(rawStep) : rawStep;
        var fullBandWidth = step * (count - paddingInner);
        var x0 = r0 + (width - fullBandWidth) / 2;
        var start = round ? Math.round(x0) : x0;
        var bw = step * (1 - paddingInner);
        var bandwidth = round ? Math.round(bw) : bw;
        var rawBandwidth = rawStep * (1 - paddingInner);
        var values = [];
        for (var i = 0; i < count; i++) {
            values.push(start + step * i);
        }
        this._bandwidth = bandwidth;
        this._rawBandwidth = rawBandwidth;
        this.ordinalRange = values;
    };
    return BandScale;
}());
exports.BandScale = BandScale;
//# sourceMappingURL=bandScale.js.map