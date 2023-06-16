"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogAxis = void 0;
var validation_1 = require("../../util/validation");
var default_1 = require("../../util/default");
var logScale_1 = require("../../scale/logScale");
var numberAxis_1 = require("./numberAxis");
var array_1 = require("../../util/array");
var logger_1 = require("../../util/logger");
function NON_ZERO_NUMBER() {
    // Cannot be 0
    var message = "expecting a non-zero Number";
    return validation_1.predicateWithMessage(function (v) { return typeof v === 'number' && v !== 0; }, message);
}
var LogAxis = /** @class */ (function (_super) {
    __extends(LogAxis, _super);
    function LogAxis(moduleCtx) {
        var _this = _super.call(this, moduleCtx, new logScale_1.LogScale()) || this;
        _this.min = NaN;
        _this.max = NaN;
        _this.scale.strictClampByDefault = true;
        return _this;
    }
    LogAxis.prototype.normaliseDataDomain = function (d) {
        var _a;
        var _b = this, min = _b.min, max = _b.max;
        if (d.length > 2) {
            d = (_a = array_1.extent(d)) !== null && _a !== void 0 ? _a : [NaN, NaN];
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
                logger_1.Logger.warn("the data domain crosses zero, the chart data cannot be rendered. See log axis documentation for more information.");
            }
            else if (hasZeroExtent) {
                logger_1.Logger.warn("the data domain has 0 extent, no data is rendered.");
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
        validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(), validation_1.LESS_THAN('max'), NON_ZERO_NUMBER())),
        default_1.Default(NaN)
    ], LogAxis.prototype, "min", void 0);
    __decorate([
        validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(), validation_1.GREATER_THAN('min'), NON_ZERO_NUMBER())),
        default_1.Default(NaN)
    ], LogAxis.prototype, "max", void 0);
    return LogAxis;
}(numberAxis_1.NumberAxis));
exports.LogAxis = LogAxis;
//# sourceMappingURL=logAxis.js.map