"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberAxis = void 0;
var linearScale_1 = require("../../scale/linearScale");
var array_1 = require("../../util/array");
var value_1 = require("../../util/value");
var chartAxis_1 = require("../chartAxis");
var function_1 = require("../../util/function");
var validation_1 = require("../../util/validation");
var secondaryAxisTicks_1 = require("../../util/secondaryAxisTicks");
function NUMBER_OR_NAN(min, max) {
    // Can be NaN or finite number
    var message = "expecting a finite Number" + ((min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : ''));
    return validation_1.predicateWithMessage(function (v) {
        return typeof v === 'number' &&
            (isNaN(v) || Number.isFinite(v)) &&
            (min !== undefined ? v >= min : true) &&
            (max !== undefined ? v <= max : true);
    }, message);
}
var NumberAxis = /** @class */ (function (_super) {
    __extends(NumberAxis, _super);
    function NumberAxis(scale) {
        if (scale === void 0) { scale = new linearScale_1.LinearScale(); }
        var _this = _super.call(this, scale) || this;
        _this.min = NaN;
        _this.max = NaN;
        scale.strictClampByDefault = true;
        return _this;
    }
    NumberAxis.prototype.normaliseDataDomain = function (d) {
        var _a = this, min = _a.min, max = _a.max;
        if (d.length > 2) {
            d = array_1.extent(d, value_1.isContinuous, Number) || [NaN, NaN];
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
            function_1.doOnce(function () {
                return console.warn('AG Charts - Data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.');
            }, "number axis config used with Date objects");
            return String(datum);
        }
    };
    NumberAxis.prototype.updateSecondaryAxisTicks = function (primaryTickCount) {
        if (this.dataDomain == null) {
            throw new Error('AG Charts - dataDomain not calculated, cannot perform tick calculation.');
        }
        var _a = __read(secondaryAxisTicks_1.calculateNiceSecondaryAxis(this.dataDomain, primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : 0), 2), d = _a[0], ticks = _a[1];
        this.scale.nice = false;
        this.scale.domain = d;
        this.scale.update();
        return ticks;
    };
    NumberAxis.className = 'NumberAxis';
    NumberAxis.type = 'number';
    __decorate([
        validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.LESS_THAN('max')))
    ], NumberAxis.prototype, "min", void 0);
    __decorate([
        validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.GREATER_THAN('min')))
    ], NumberAxis.prototype, "max", void 0);
    return NumberAxis;
}(chartAxis_1.ChartAxis));
exports.NumberAxis = NumberAxis;
//# sourceMappingURL=numberAxis.js.map