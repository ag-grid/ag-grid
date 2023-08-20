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
import { normalisedExtent } from '../../util/array';
import { Validate, GREATER_THAN, AND, LESS_THAN, NUMBER_OR_NAN } from '../../util/validation';
import { Default } from '../../util/default';
import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';
import { Logger } from '../../util/logger';
import { AxisTick } from './axisTick';
import { CartesianAxis } from './cartesianAxis';
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
}(AxisTick));
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
        var _a = this, min = _a.min, max = _a.max;
        return normalisedExtent(d, min, max);
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
}(CartesianAxis));
export { NumberAxis };
