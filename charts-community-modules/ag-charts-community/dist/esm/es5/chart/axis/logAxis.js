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
import { AND, GREATER_THAN, LESS_THAN, NUMBER_OR_NAN, predicateWithMessage, Validate } from '../../util/validation';
import { Default } from '../../util/default';
import { LogScale } from '../../scale/logScale';
import { NumberAxis } from './numberAxis';
import { extent } from '../../util/array';
import { Logger } from '../../util/logger';
function NON_ZERO_NUMBER() {
    // Cannot be 0
    var message = "expecting a non-zero Number";
    return predicateWithMessage(function (v) { return typeof v === 'number' && v !== 0; }, message);
}
var LogAxis = /** @class */ (function (_super) {
    __extends(LogAxis, _super);
    function LogAxis(moduleCtx) {
        var _this = _super.call(this, moduleCtx, new LogScale()) || this;
        _this.min = NaN;
        _this.max = NaN;
        _this.scale.strictClampByDefault = true;
        return _this;
    }
    LogAxis.prototype.normaliseDataDomain = function (d) {
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
        var isInverted = d[0] > d[1];
        var crossesZero = d[0] < 0 && d[1] > 0;
        var hasZeroExtent = d[0] === 0 && d[1] === 0;
        var invalidDomain = isInverted || crossesZero || hasZeroExtent;
        if (invalidDomain) {
            d = [];
            if (crossesZero) {
                Logger.warn("the data domain crosses zero, the chart data cannot be rendered. See log axis documentation for more information.");
            }
            else if (hasZeroExtent) {
                Logger.warn("the data domain has 0 extent, no data is rendered.");
            }
        }
        if (d[0] === 0) {
            d[0] = 1;
        }
        if (d[1] === 0) {
            d[1] = -1;
        }
        return d;
    };
    Object.defineProperty(LogAxis.prototype, "base", {
        get: function () {
            return this.scale.base;
        },
        set: function (value) {
            this.scale.base = value;
        },
        enumerable: false,
        configurable: true
    });
    LogAxis.className = 'LogAxis';
    LogAxis.type = 'log';
    __decorate([
        Validate(AND(NUMBER_OR_NAN(), LESS_THAN('max'), NON_ZERO_NUMBER())),
        Default(NaN)
    ], LogAxis.prototype, "min", void 0);
    __decorate([
        Validate(AND(NUMBER_OR_NAN(), GREATER_THAN('min'), NON_ZERO_NUMBER())),
        Default(NaN)
    ], LogAxis.prototype, "max", void 0);
    return LogAxis;
}(NumberAxis));
export { LogAxis };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nQXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9heGlzL2xvZ0F4aXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNwSCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUczQyxTQUFTLGVBQWU7SUFDcEIsY0FBYztJQUNkLElBQU0sT0FBTyxHQUFHLDZCQUE2QixDQUFDO0lBRTlDLE9BQU8sb0JBQW9CLENBQUMsVUFBQyxDQUFNLElBQUssT0FBQSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBaEMsQ0FBZ0MsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RixDQUFDO0FBRUQ7SUFBNkIsMkJBQVU7SUF5RG5DLGlCQUFZLFNBQXdCO1FBQXBDLFlBQ0ksa0JBQU0sU0FBUyxFQUFFLElBQUksUUFBUSxFQUFFLENBQUMsU0FFbkM7UUFoQkQsU0FBRyxHQUFXLEdBQUcsQ0FBQztRQUlsQixTQUFHLEdBQVcsR0FBRyxDQUFDO1FBV2QsS0FBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7O0lBQzNDLENBQUM7SUF4REQscUNBQW1CLEdBQW5CLFVBQW9CLENBQVc7O1FBQ3JCLElBQUEsS0FBZSxJQUFJLEVBQWpCLEdB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