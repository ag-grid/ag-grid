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
import { Logger } from '../util/logger';
var ContinuousScale = /** @class */ (function () {
    function ContinuousScale(domain, range) {
        this.domain = domain;
        this.range = range;
        this.nice = false;
        this.tickCount = ContinuousScale.defaultTickCount;
        this.minTickCount = 0;
        this.maxTickCount = Infinity;
        this.niceDomain = null;
        this.strictClampByDefault = false;
        this.cache = null;
        this.cacheProps = ['domain', 'range', 'nice', 'tickCount', 'minTickCount', 'maxTickCount'];
    }
    ContinuousScale.prototype.transform = function (x) {
        return x;
    };
    ContinuousScale.prototype.transformInvert = function (x) {
        return x;
    };
    ContinuousScale.prototype.fromDomain = function (d) {
        if (typeof d === 'number') {
            return d;
        }
        else if (d instanceof Date) {
            return d.getTime();
        }
        return NaN;
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
        var isReversed = r0 > r1;
        var rMin = isReversed ? r1 : r0;
        var rMax = isReversed ? r0 : r1;
        var d;
        if (x < rMin) {
            return isReversed ? d1 : d0;
        }
        else if (x > rMax) {
            return isReversed ? d0 : d1;
        }
        else if (r0 === r1) {
            d = this.toDomain((this.fromDomain(d0) + this.fromDomain(d1)) / 2);
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
            Logger.warn("the configured tick interval results in more than 1 tick per pixel, ignoring. Supply a larger tick interval or omit this configuration.");
            return true;
        }
        return false;
    };
    ContinuousScale.defaultTickCount = 5;
    ContinuousScale.defaultMaxTickCount = 6;
    return ContinuousScale;
}());
export { ContinuousScale };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGludW91c1NjYWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjYWxlL2NvbnRpbnVvdXNTY2FsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSXhDO0lBV0kseUJBQTZCLE1BQVcsRUFBUyxLQUFlO1FBQW5DLFdBQU0sR0FBTixNQUFNLENBQUs7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFVO1FBUGhFLFNBQUksR0FBRyxLQUFLLENBQUM7UUFFYixjQUFTLEdBQUcsZUFBZSxDQUFDLGdCQUFnQixDQUFDO1FBQzdDLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLGlCQUFZLEdBQUcsUUFBUSxDQUFDO1FBQ3hCLGVBQVUsR0FBVSxJQUFXLENBQUM7UUFpQ2hDLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQWlFbkIsVUFBSyxHQUFRLElBQUksQ0FBQztRQUNsQixlQUFVLEdBQXNCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQWpHaEQsQ0FBQztJQUUxRCxtQ0FBUyxHQUFuQixVQUFvQixDQUFJO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUNTLHlDQUFlLEdBQXpCLFVBQTBCLENBQUk7UUFDMUIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQsb0NBQVUsR0FBVixVQUFXLENBQUk7UUFDWCxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUN2QixPQUFPLENBQUMsQ0FBQztTQUNaO2FBQU0sSUFBSSxDQUFDLFlBQVksSUFBSSxFQUFFO1lBQzFCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3RCO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBSVMsbUNBQVMsR0FBbkI7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