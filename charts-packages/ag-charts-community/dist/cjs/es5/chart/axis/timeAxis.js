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
Object.defineProperty(exports, "__esModule", { value: true });
var timeScale_1 = require("../../scale/timeScale");
var array_1 = require("../../util/array");
var value_1 = require("../../util/value");
var chartAxis_1 = require("../chartAxis");
var TimeAxis = /** @class */ (function (_super) {
    __extends(TimeAxis, _super);
    function TimeAxis() {
        var _this = _super.call(this, new timeScale_1.TimeScale()) || this;
        _this.datumFormat = '%m/%d/%y, %H:%M:%S';
        _this._nice = true;
        var scale = _this.scale;
        scale.clamp = true;
        _this.scale = scale;
        _this.datumFormatter = scale.tickFormat(_this.calculatedTickCount, _this.datumFormat);
        return _this;
    }
    Object.defineProperty(TimeAxis.prototype, "nice", {
        get: function () {
            return this._nice;
        },
        set: function (value) {
            if (this._nice !== value) {
                this._nice = value;
                if (value && this.scale.nice) {
                    this.scale.nice(10);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeAxis.prototype, "domain", {
        get: function () {
            return this.scale.domain;
        },
        set: function (domain) {
            if (domain.length > 2) {
                domain = (array_1.extent(domain, value_1.isContinuous, Number) || [0, 1000]).map(function (x) { return new Date(x); });
            }
            this.scale.domain = domain;
            if (this.nice && this.scale.nice) {
                this.scale.nice(10);
            }
        },
        enumerable: true,
        configurable: true
    });
    TimeAxis.prototype.onLabelFormatChange = function (format) {
        if (format) {
            _super.prototype.onLabelFormatChange.call(this, format);
        }
        else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat(this.calculatedTickCount, undefined);
        }
    };
    TimeAxis.prototype.formatDatum = function (datum) {
        return this.datumFormatter(datum);
    };
    TimeAxis.className = 'TimeAxis';
    TimeAxis.type = 'time';
    return TimeAxis;
}(chartAxis_1.ChartAxis));
exports.TimeAxis = TimeAxis;
