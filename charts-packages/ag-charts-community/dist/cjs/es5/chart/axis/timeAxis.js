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
Object.defineProperty(exports, "__esModule", { value: true });
var validation_1 = require("../../util/validation");
var timeScale_1 = require("../../scale/timeScale");
var array_1 = require("../../util/array");
var value_1 = require("../../util/value");
var chartAxis_1 = require("../chartAxis");
var continuousScale_1 = require("../../scale/continuousScale");
var TimeAxis = /** @class */ (function (_super) {
    __extends(TimeAxis, _super);
    function TimeAxis() {
        var _this = _super.call(this, new timeScale_1.TimeScale()) || this;
        _this.datumFormat = '%m/%d/%y, %H:%M:%S';
        _this.min = undefined;
        _this.max = undefined;
        var scale = _this.scale;
        scale.clamp = true;
        scale.clamper = continuousScale_1.filter;
        _this.refreshScale();
        _this.datumFormatter = scale.tickFormat({
            specifier: _this.datumFormat,
        });
        return _this;
    }
    TimeAxis.prototype.normaliseDataDomain = function (d) {
        var _a = this, min = _a.min, max = _a.max;
        if (typeof min === 'number') {
            min = new Date(min);
        }
        if (typeof max === 'number') {
            max = new Date(max);
        }
        if (d.length > 2) {
            d = (array_1.extent(d, value_1.isContinuous, Number) || [0, 1000]).map(function (x) { return new Date(x); });
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
        return this.datumFormatter(datum);
    };
    TimeAxis.className = 'TimeAxis';
    TimeAxis.type = 'time';
    __decorate([
        validation_1.Validate(validation_1.AND(validation_1.OPT_DATE_OR_DATETIME_MS, validation_1.LESS_THAN('max')))
    ], TimeAxis.prototype, "min", void 0);
    __decorate([
        validation_1.Validate(validation_1.AND(validation_1.OPT_DATE_OR_DATETIME_MS, validation_1.GREATER_THAN('min')))
    ], TimeAxis.prototype, "max", void 0);
    return TimeAxis;
}(chartAxis_1.ChartAxis));
exports.TimeAxis = TimeAxis;
