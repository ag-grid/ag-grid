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
export class TimeAxis extends ChartAxis {
    constructor() {
        super(new TimeScale());
        this.datumFormat = '%m/%d/%y, %H:%M:%S';
        this.min = undefined;
        this.max = undefined;
        const { scale } = this;
        scale.strictClampByDefault = true;
        this.refreshScale();
        this.datumFormatter = scale.tickFormat({
            specifier: this.datumFormat,
        });
    }
    normaliseDataDomain(d) {
        let { min, max } = this;
        if (typeof min === 'number') {
            min = new Date(min);
        }
        if (typeof max === 'number') {
            max = new Date(max);
        }
        if (d.length > 2) {
            d = (extent(d) || [0, 1000]).map((x) => new Date(x));
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
    }
    onLabelFormatChange(ticks, format) {
        if (format) {
            super.onLabelFormatChange(ticks, format);
        }
        else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat({ ticks });
        }
    }
    formatDatum(datum) {
        return this.datumFormatter(datum);
    }
}
TimeAxis.className = 'TimeAxis';
TimeAxis.type = 'time';
__decorate([
    Validate(AND(OPT_DATE_OR_DATETIME_MS, LESS_THAN('max')))
], TimeAxis.prototype, "min", void 0);
__decorate([
    Validate(AND(OPT_DATE_OR_DATETIME_MS, GREATER_THAN('min')))
], TimeAxis.prototype, "max", void 0);
