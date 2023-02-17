var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
function NON_ZERO_NUMBER() {
    // Cannot be 0
    var message = "expecting a non-zero Number";
    return predicateWithMessage(function (v) { return typeof v === 'number' && v !== 0; }, message);
}
var LogAxis = /** @class */ (function (_super) {
    __extends(LogAxis, _super);
    function LogAxis() {
        var _this = _super.call(this, new LogScale()) || this;
        _this.min = NaN;
        _this.max = NaN;
        _this.scale.strictClampByDefault = true;
        return _this;
    }
    LogAxis.prototype.normaliseDataDomain = function (d) {
        var _a = this, min = _a.min, max = _a.max;
        if (d.length > 2) {
            d = extent(d) || [NaN, NaN];
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
            var warningMessage = crossesZero
                ? 'The data domain crosses zero, the chart data cannot be rendered. See log axis documentation for more information.'
                : hasZeroExtent
                    ? 'The data domain has 0 extent, no data is rendered.'
                    : undefined;
            if (warningMessage) {
                console.warn("AG Charts - " + warningMessage);
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
