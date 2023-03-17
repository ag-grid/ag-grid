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
import { Validate, AND, LESS_THAN, GREATER_THAN, OPT_DATE_OR_DATETIME_MS } from '../../util/validation';
import { TimeScale } from '../../scale/timeScale';
import { extent } from '../../util/array';
import { ChartAxis } from '../chartAxis';
var TimeAxis = /** @class */ (function (_super) {
    __extends(TimeAxis, _super);
    function TimeAxis(moduleCtx) {
        var _this = _super.call(this, moduleCtx, new TimeScale()) || this;
        _this.datumFormat = '%m/%d/%y, %H:%M:%S';
        _this.min = undefined;
        _this.max = undefined;
        var scale = _this.scale;
        scale.strictClampByDefault = true;
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
            d = (extent(d) || [0, 1000]).map(function (x) { return new Date(x); });
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
        Validate(AND(OPT_DATE_OR_DATETIME_MS, LESS_THAN('max')))
    ], TimeAxis.prototype, "min", void 0);
    __decorate([
        Validate(AND(OPT_DATE_OR_DATETIME_MS, GREATER_THAN('min')))
    ], TimeAxis.prototype, "max", void 0);
    return TimeAxis;
}(ChartAxis));
export { TimeAxis };
