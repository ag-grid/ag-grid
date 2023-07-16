"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxisTick = void 0;
var validation_1 = require("../../util/validation");
var default_1 = require("../../util/default");
var deprecation_1 = require("../../util/deprecation");
var interval_1 = require("../../util/time/interval");
var TICK_COUNT = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.NUMBER(0)(v, ctx) || v instanceof interval_1.TimeInterval; }, "expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var OPT_TICK_COUNT = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, TICK_COUNT); }, "expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var OPT_TICK_INTERVAL = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, function (v, ctx) { return (v !== 0 && validation_1.NUMBER(0)(v, ctx)) || v instanceof interval_1.TimeInterval; }); }, "expecting an optional non-zero positive Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var AxisTick = /** @class */ (function () {
    function AxisTick() {
        this.enabled = true;
        /**
         * The line width to be used by axis ticks.
         */
        this.width = 1;
        /**
         * The line length to be used by axis ticks.
         */
        this.size = 6;
        /**
         * The color of the axis ticks.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
         */
        this.color = 'rgba(195, 195, 195, 1)';
        /**
         * A hint of how many ticks to use (the exact number of ticks might differ),
         * a `TimeInterval` or a `CountableTimeInterval`.
         * For example:
         *
         *     axis.tick.count = 5;
         *     axis.tick.count = year;
         *     axis.tick.count = month.every(6);
         */
        this.count = undefined;
        this.interval = undefined;
        this.values = undefined;
        this.minSpacing = NaN;
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisTick.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AxisTick.prototype, "width", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AxisTick.prototype, "size", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], AxisTick.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(OPT_TICK_COUNT),
        deprecation_1.Deprecated('Use tick.interval or tick.minSpacing and tick.maxSpacing instead')
    ], AxisTick.prototype, "count", void 0);
    __decorate([
        validation_1.Validate(OPT_TICK_INTERVAL)
    ], AxisTick.prototype, "interval", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_ARRAY())
    ], AxisTick.prototype, "values", void 0);
    __decorate([
        validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(1), validation_1.LESS_THAN('maxSpacing'))),
        default_1.Default(NaN)
    ], AxisTick.prototype, "minSpacing", void 0);
    return AxisTick;
}());
exports.AxisTick = AxisTick;
//# sourceMappingURL=axisTick.js.map