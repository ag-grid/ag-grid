var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { ContinuousScale } from './continuousScale';
import ticks, { range, tickStep, singleTickDomain } from '../util/ticks';
import { tickFormat } from '../util/numberFormat';
/**
 * Maps continuous domain to a continuous range.
 */
var LinearScale = /** @class */ (function (_super) {
    __extends(LinearScale, _super);
    function LinearScale() {
        var _this = _super.call(this, [0, 1], [0, 1]) || this;
        _this.type = 'linear';
        return _this;
    }
    LinearScale.prototype.toDomain = function (d) {
        return d;
    };
    LinearScale.prototype.ticks = function () {
        var _a;
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : ContinuousScale.defaultTickCount;
        if (!this.domain || this.domain.length < 2 || count < 1 || this.domain.some(function (d) { return !isFinite(d); })) {
            return [];
        }
        this.refresh();
        var _b = __read(this.getDomain(), 2), d0 = _b[0], d1 = _b[1];
        var interval = this.interval;
        if (interval) {
            var step = Math.abs(interval);
            if (!this.isDenseInterval({ start: d0, stop: d1, interval: step })) {
                return range(d0, d1, step);
            }
        }
        return ticks(d0, d1, count, this.minTickCount, this.maxTickCount);
    };
    LinearScale.prototype.update = function () {
        if (!this.domain || this.domain.length < 2) {
            return;
        }
        if (this.nice) {
            this.updateNiceDomain();
        }
    };
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    LinearScale.prototype.updateNiceDomain = function () {
        var _a, _b;
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : ContinuousScale.defaultTickCount;
        var _c = __read(this.domain, 2), start = _c[0], stop = _c[1];
        if (count < 1) {
            this.niceDomain = [start, stop];
            return;
        }
        if (count === 1) {
            this.niceDomain = singleTickDomain(start, stop);
            return;
        }
        var maxAttempts = 4;
        var prev0 = start;
        var prev1 = stop;
        for (var i = 0; i < maxAttempts; i++) {
            var step = (_b = this.interval) !== null && _b !== void 0 ? _b : tickStep(start, stop, count, this.minTickCount, this.maxTickCount);
            var _d = __read(this.domain, 2), d0 = _d[0], d1 = _d[1];
            if (step >= 1) {
                start = Math.floor(d0 / step) * step;
                stop = Math.ceil(d1 / step) * step;
            }
            else {
                // Prevent floating point error
                var s = 1 / step;
                start = Math.floor(d0 * s) / s;
                stop = Math.ceil(d1 * s) / s;
            }
            if (start === prev0 && stop === prev1) {
                break;
            }
            prev0 = start;
            prev1 = stop;
        }
        this.niceDomain = [start, stop];
    };
    LinearScale.prototype.tickFormat = function (_a) {
        var ticks = _a.ticks, specifier = _a.specifier;
        return tickFormat(ticks !== null && ticks !== void 0 ? ticks : this.ticks(), specifier);
    };
    return LinearScale;
}(ContinuousScale));
export { LinearScale };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZWFyU2NhbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NhbGUvbGluZWFyU2NhbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWxEOztHQUVHO0FBQ0g7SUFBaUMsK0JBQXVCO0lBS3BEO1FBQUEsWUFDSSxrQkFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUN4QjtRQU5RLFVBQUksR0FBRyxRQUFRLENBQUM7O0lBTXpCLENBQUM7SUFFRCw4QkFBUSxHQUFSLFVBQVMsQ0FBUztRQUNkLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVELDJCQUFLLEdBQUw7O1FBQ0ksSUFBTSxLQUFLLEdBQUcsTUFBQSxJQUFJLENBQUMsU0FBUyxtQ0FBSSxlQUFlLENBQUMsZ0JBQWdCLENBQUM7UUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBWixDQUFZLENBQUMsRUFBRTtZQUM5RixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ1QsSUFBQSxLQUFBLE9BQVcsSUFBSSxDQUFDLFNBQVMsRUFBRSxJ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