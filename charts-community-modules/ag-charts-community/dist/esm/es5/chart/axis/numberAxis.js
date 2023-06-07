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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { LinearScale } from '../../scale/linearScale';
import { extent } from '../../util/array';
import { ChartAxis } from '../chartAxis';
import { Validate, GREATER_THAN, AND, LESS_THAN, NUMBER_OR_NAN } from '../../util/validation';
import { Default } from '../../util/default';
import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';
import { Logger } from '../../util/logger';
import { BaseAxisTick } from '../../axis';
var NumberAxisTick = /** @class */ (function (_super) {
    __extends(NumberAxisTick, _super);
    function NumberAxisTick() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.maxSpacing = NaN;
        return _this;
    }
    __decorate([
        Validate(AND(NUMBER_OR_NAN(1), GREATER_THAN('minSpacing'))),
        Default(NaN)
    ], NumberAxisTick.prototype, "maxSpacing", void 0);
    return NumberAxisTick;
}(BaseAxisTick));
var NumberAxis = /** @class */ (function (_super) {
    __extends(NumberAxis, _super);
    function NumberAxis(moduleCtx, scale) {
        if (scale === void 0) { scale = new LinearScale(); }
        var _this = _super.call(this, moduleCtx, scale) || this;
        _this.min = NaN;
        _this.max = NaN;
        scale.strictClampByDefault = true;
        return _this;
    }
    NumberAxis.prototype.normaliseDataDomain = function (d) {
        var _a;
        var _b = this, min = _b.min, max = _b.max;
        if (d.length > 2) {
            d = (_a = extent(d)) !== null && _a !== void 0 ? _a : [NaN, NaN];
        }
        if (!isNaN(min)) {
            d = [min, d[1]];
        }
        if (!isNaN(max)) {
            d = [d[0], max];
        }
        if (d[0] > d[1]) {
            d = [];
        }
        return d;
    };
    NumberAxis.prototype.formatDatum = function (datum) {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        }
        else {
            Logger.warnOnce('data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.');
            return String(datum);
        }
    };
    NumberAxis.prototype.createTick = function () {
        return new NumberAxisTick();
    };
    NumberAxis.prototype.updateSecondaryAxisTicks = function (primaryTickCount) {
        if (this.dataDomain == null) {
            throw new Error('AG Charts - dataDomain not calculated, cannot perform tick calculation.');
        }
        var _a = __read(calculateNiceSecondaryAxis(this.dataDomain, primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : 0), 2), d = _a[0], ticks = _a[1];
        this.scale.nice = false;
        this.scale.domain = d;
        this.scale.update();
        return ticks;
    };
    NumberAxis.className = 'NumberAxis';
    NumberAxis.type = 'number';
    __decorate([
        Validate(AND(NUMBER_OR_NAN(), LESS_THAN('max'))),
        Default(NaN)
    ], NumberAxis.prototype, "min", void 0);
    __decorate([
        Validate(AND(NUMBER_OR_NAN(), GREATER_THAN('min'))),
        Default(NaN)
    ], NumberAxis.prototype, "max", void 0);
    return NumberAxis;
}(ChartAxis));
export { NumberAxis };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyQXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9heGlzL251bWJlckF4aXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN6QyxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzlGLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMzRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFM0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUxQztJQUE2QixrQ0FBNEM7SUFBekU7UUFBQSxxRUFJQztRQURHLGdCQUFVLEdBQVcsR0FBRyxDQUFDOztJQUM3QixDQUFDO0lBREc7UUFGQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDO3NEQUNZO0lBQzdCLHFCQUFDO0NBQUEsQUFKRCxDQUE2QixZQUFZLEdBSXhDO0FBRUQ7SUFBZ0MsOEJBQXlDO0lBSXJFLG9CQUFZLFNBQXdCLEVBQUUsS0FBbUQ7UUFBbkQsc0JBQUEsRUFBQSxRQUFRLElBQUksV0FBVyxFQUE0QjtRQUF6RixZQUNJLGtCQUFNLFNBQVMsRUFBRSxLQUFLLENB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