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
    BandScale.prototype.invert = function (position) {
        this.refresh();
        var index = this.ordinalRange.findIndex(function (p) { return p === position; });
        return this.domain[index];
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
export { BandScale };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFuZFNjYWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjYWxlL2JhbmRTY2FsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsU0FBUyxLQUFLLENBQUMsQ0FBUyxFQUFFLEdBQVcsRUFBRSxHQUFXO0lBQzlDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7O0dBRUc7QUFDSDtJQUFBO1FBQ2EsU0FBSSxHQUFHLE1BQU0sQ0FBQztRQUlmLFVBQUssR0FBUSxJQUFJLENBQUM7UUFDbEIsZUFBVSxHQUFhLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQWtCM0c7OztXQUdHO1FBQ0ssVUFBSyxHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7UUFFckM7O1dBRUc7UUFDSyxpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUVwQzs7OztXQUlHO1FBQ0ssWUFBTyxHQUFRLEVBQUUsQ0FBQztRQXVCMUIsVUFBSyxHQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBOEJqQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBTXZCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBZWxDOztXQUVHO1FBQ0ssa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFRMUI7OztXQUdHO1FBQ0ssa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFRMUIsVUFBSyxHQUFHLEtBQUssQ0FBQztJQWdDbEIsQ0FBQztJQWxLVyw2QkFBUyxHQUFqQjtRQUFBLGlCQVNDO1FBUlcsSUFBQSxLQUFLLEdBQUssSUFBSSxNQUFULENBQVU7UUFDdkIsSUFBTSxTQUFTLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFVBQVUs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