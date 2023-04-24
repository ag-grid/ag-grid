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
        if (d.length > 2) {
            d = extent(d) || [NaN, NaN];
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
