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
var ContinuousScale = /** @class */ (function () {
    function ContinuousScale(domain, range) {
        this.domain = domain;
        this.range = range;
        this.nice = false;
        this.tickCount = ContinuousScale.defaultTickCount;
        this.niceDomain = null;
        this.strictClampByDefault = false;
        this.cache = null;
        this.cacheProps = ['domain', 'range', 'nice', 'tickCount'];
    }
    ContinuousScale.prototype.transform = function (x) {
        return x;
    };
    ContinuousScale.prototype.transformInvert = function (x) {
        return x;
    };
    ContinuousScale.prototype.fromDomain = function (d) {
        if (d instanceof Date) {
            return d.getTime();
        }
        return d;
    };
    ContinuousScale.prototype.getDomain = function () {
        if (this.nice) {
            this.refresh();
            if (this.niceDomain) {
                return this.niceDomain;
            }
        }
        return this.domain;
    };
    ContinuousScale.prototype.convert = function (x, params) {
        var _this = this;
        var _a;
        if (!this.domain || this.domain.length < 2) {
            return NaN;
        }
        this.refresh();
        var strict = (_a = params === null || params === void 0 ? void 0 : params.strict) !== null && _a !== void 0 ? _a : this.strictClampByDefault;
        var domain = this.getDomain().map(function (d) { return _this.transform(d); });
        var _b = __read(domain, 2), d0 = _b[0], d1 = _b[1];
        var range = this.range;
        var _c = __read(range, 2), r0 = _c[0], r1 = _c[1];
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
    };
    ContinuousScale.prototype.invert = function (x) {
        var _this = this;
        this.refresh();
        var domain = this.getDomain().map(function (d) { return _this.transform(d); });
        var _a = __read(domain, 2), d0 = _a[0], d1 = _a[1];
        var range = this.range;
        var _b = __read(range, 2), r0 = _b[0], r1 = _b[1];
        var d;
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
    };
    ContinuousScale.prototype.didChange = function () {
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
    ContinuousScale.prototype.refresh = function () {
        if (this.didChange()) {
            this.update();
        }
    };
    ContinuousScale.prototype.isDenseInterval = function (_a) {
        var start = _a.start, stop = _a.stop, interval = _a.interval, count = _a.count;
        var range = this.range;
        var domain = stop - start;
        var min = Math.min(range[0], range[1]);
        var max = Math.max(range[0], range[1]);
        var availableRange = max - min;
        var step = typeof interval === 'number' ? interval : 1;
        count !== null && count !== void 0 ? count : (count = domain / step);
        if (count >= availableRange) {
            console.warn("AG Charts - the configured tick interval, " + JSON.stringify(interval) + ", results in more than 1 tick per pixel, ignoring. Supply a larger tick interval or omit this configuration.");
            return true;
        }
        return false;
    };
    ContinuousScale.defaultTickCount = 5;
    return ContinuousScale;
}());
export { ContinuousScale };
