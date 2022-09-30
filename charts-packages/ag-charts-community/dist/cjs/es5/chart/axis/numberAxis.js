"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var secondaryAxisTicks_1 = require("../../util/secondaryAxisTicks");
var linearScale_1 = require("../../scale/linearScale");
var array_1 = require("../../util/array");
var value_1 = require("../../util/value");
var chartAxis_1 = require("../chartAxis");
var function_1 = require("../../util/function");
var validation_1 = require("../../util/validation");
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
// Instead of clamping the values outside of domain to the range,
// return NaNs to indicate invalid input.
function clamper(domain) {
    var _a;
    var a = domain[0];
    var b = domain[domain.length - 1];
    if (a > b) {
        _a = __read([b, a], 2), a = _a[0], b = _a[1];
    }
    return function (x) { return (x >= a && x <= b ? x : NaN); };
}
exports.clamper = clamper;
var NumberAxis = /** @class */ (function (_super) {
    __extends(NumberAxis, _super);
    function NumberAxis() {
        var _this = _super.call(this, new linearScale_1.LinearScale()) || this;
        _this._nice = true;
        _this.min = NaN;
        _this.max = NaN;
        _this.scale.clamper = clamper;
        return _this;
    }
    Object.defineProperty(NumberAxis.prototype, "nice", {
        get: function () {
            return this._nice;
        },
        set: function (value) {
            if (this._nice !== value) {
                this._nice = value;
                if (value && this.scale.nice) {
                    this.scale.nice(typeof this.calculatedTickCount === 'number' ? this.calculatedTickCount : undefined);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    NumberAxis.prototype.setDomain = function (domain, primaryTickCount) {
        var _a = this, scale = _a.scale, min = _a.min, max = _a.max;
        if (domain.length > 2) {
            domain = array_1.extent(domain, value_1.isContinuous, Number) || [];
        }
        domain = [isNaN(min) ? domain[0] : min, isNaN(max) ? domain[1] : max];
        if (primaryTickCount) {
            // when `primaryTickCount` is supplied the current axis is a secondary axis which needs to be aligned to
            // the primary by constraining the tick count to the primary axis tick count
            if (isNaN(domain[0]) || isNaN(domain[1])) {
                scale.domain = domain;
                this.ticks = undefined;
                return;
            }
            var _b = __read(secondaryAxisTicks_1.calculateNiceSecondaryAxis(domain, primaryTickCount), 2), d = _b[0], ticks = _b[1];
            scale.domain = d;
            this.ticks = ticks;
            return;
        }
        else {
            scale.domain = domain;
            this.onLabelFormatChange(this.label.format); // not sure why this is required?
            this.scale.clamp = true;
            if (this.nice && this.scale.nice) {
                this.scale.nice(typeof this.calculatedTickCount === 'number' ? this.calculatedTickCount : undefined);
            }
        }
    };
    Object.defineProperty(NumberAxis.prototype, "domain", {
        get: function () {
            return this.scale.domain;
        },
        set: function (domain) {
            this.setDomain(domain);
        },
        enumerable: true,
        configurable: true
    });
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
    NumberAxis.prototype.updateDomain = function (domain, isYAxis, primaryTickCount) {
        var _a = this, min = _a.min, max = _a.max;
        if (domain.length > 2) {
            domain = array_1.extent(domain, value_1.isContinuous, Number) || [NaN, NaN];
        }
        if (!isNaN(min)) {
            domain = [min, domain[1]];
        }
        if (!isNaN(max)) {
            domain = [domain[0], max];
        }
        if (domain[0] > domain[1]) {
            domain = [];
        }
        if (isYAxis) {
            // the `primaryTickCount` is used to align the secondary axis tick count with the primary
            this.setDomain(domain, primaryTickCount);
            return primaryTickCount || this.scale.ticks(this.calculatedTickCount).length;
        }
        return _super.prototype.updateDomain.call(this, domain, isYAxis, primaryTickCount);
    };
    NumberAxis.className = 'NumberAxis';
    NumberAxis.type = 'number';
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], NumberAxis.prototype, "_nice", void 0);
    __decorate([
        validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.LESS_THAN('max')))
    ], NumberAxis.prototype, "min", void 0);
    __decorate([
        validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.GREATER_THAN('min')))
    ], NumberAxis.prototype, "max", void 0);
    return NumberAxis;
}(chartAxis_1.ChartAxis));
exports.NumberAxis = NumberAxis;
