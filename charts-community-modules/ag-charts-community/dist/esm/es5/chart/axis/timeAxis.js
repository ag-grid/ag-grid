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
import { Validate, AND, LESS_THAN, GREATER_THAN, OPT_DATE_OR_DATETIME_MS, NUMBER_OR_NAN } from '../../util/validation';
import { TimeScale } from '../../scale/timeScale';
import { extent } from '../../util/array';
import { ChartAxis } from '../chartAxis';
import { Default } from '../../util/default';
import { BaseAxisTick } from '../../axis';
var TimeAxisTick = /** @class */ (function (_super) {
    __extends(TimeAxisTick, _super);
    function TimeAxisTick() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.maxSpacing = NaN;
        return _this;
    }
    __decorate([
        Validate(AND(NUMBER_OR_NAN(1), GREATER_THAN('minSpacing'))),
        Default(NaN)
    ], TimeAxisTick.prototype, "maxSpacing", void 0);
    return TimeAxisTick;
}(BaseAxisTick));
var TimeAxis = /** @class */ (function (_super) {
    __extends(TimeAxis, _super);
    function TimeAxis(moduleCtx) {
        var _this = _super.call(this, moduleCtx, new TimeScale()) || this;
        _this.datumFormat = '%m/%d/%y, %H:%M:%S';
        _this.min = undefined;
        _this.max = undefined;
        var scale = _this.scale;
        scale.strictClampByDefault = true;
        _this.refreshScale();
        _this.datumFormatter = scale.tickFormat({
            specifier: _this.datumFormat,
        });
        return _this;
    }
    TimeAxis.prototype.normaliseDataDomain = function (d) {
        var _a;
        var _b = this, min = _b.min, max = _b.max;
        if (typeof min === 'number') {
            min = new Date(min);
        }
        if (typeof max === 'number') {
            max = new Date(max);
        }
        if (d.length > 2) {
            d = ((_a = extent(d)) !== null && _a !== void 0 ? _a : [0, 1000]).map(function (x) { return new Date(x); });
        }
        if (min instanceof Date) {
            d = [min, d[1]];
        }
        if (max instanceof Date) {
            d = [d[0], max];
        }
        if (d[0] > d[1]) {
            d = [];
        }
        return d;
    };
    TimeAxis.prototype.createTick = function () {
        return new TimeAxisTick();
    };
    TimeAxis.prototype.onLabelFormatChange = function (ticks, format) {
        if (format) {
            _super.prototype.onLabelFormatChange.call(this, ticks, format);
        }
        else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat({ ticks: ticks });
        }
    };
    TimeAxis.prototype.formatDatum = function (datum) {
        var _a;
        return (_a = this.moduleCtx.callbackCache.call(this.datumFormatter, datum)) !== null && _a !== void 0 ? _a : String(datum);
    };
    TimeAxis.prototype.calculatePadding = function (_min, _max) {
        // numbers in domain correspond to Unix timestamps
        // automatically expand domain by 1 in each direction
        return 1;
    };
    TimeAxis.className = 'TimeAxis';
    TimeAxis.type = 'time';
    __decorate([
        Validate(AND(OPT_DATE_OR_DATETIME_MS, LESS_THAN('max')))
    ], TimeAxis.prototype, "min", void 0);
    __decorate([
        Validate(AND(OPT_DATE_OR_DATETIME_MS, GREATER_THAN('min')))
    ], TimeAxis.prototype, "max", void 0);
    return TimeAxis;
}(ChartAxis));
export { TimeAxis };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZUF4aXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvYXhpcy90aW1lQXhpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLHVCQUF1QixFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3ZILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUxQztJQUEyQixnQ0FBc0M7SUFBakU7UUFBQSxxRUFJQztRQURHLGdCQUFVLEdBQVcsR0FBRyxDQUFDOztJQUM3QixDQUFDO0lBREc7UUFGQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDO29EQUNZO0lBQzdCLG1CQUFDO0NBQUEsQUFKRCxDQUEyQixZQUFZLEdBSXRDO0FBRUQ7SUFBOEIsNEJBQW1DO0lBTzdELGtCQUFZLFNBQXdCO1FBQXBDLFlBQ0ksa0JBQU0sU0FBUyxFQUFFLElBQUksU0FBUyxFQUFFLENBQUMsU0FTcEM7UUFiTyxpQkFBVyxHQUFHLG9CQUFvQixDQUFDO1FBZ0IzQyxTQUFHLEdBQW1CLFNBQVMsQ0FBQztRQUdoQyxTQUFHLEdBQW1CLFNBQVMsQ0FBQztRQWJwQixJQUFBLEtBQUssR0FBSyxLQUFJLE1BQVQsQ0FBVTtRQUN2QixL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