var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BOOLEAN, Validate, OPT_DATE, AND, LESS_THAN, GREATER_THAN } from '../../util/validation';
import { TimeScale } from '../../scale/timeScale';
import { extent } from '../../util/array';
import { isContinuous } from '../../util/value';
import { ChartAxis } from '../chartAxis';
import { clamper } from './numberAxis';
export class TimeAxis extends ChartAxis {
    constructor() {
        super(new TimeScale());
        this.datumFormat = '%m/%d/%y, %H:%M:%S';
        this.nice = true;
        this.min = undefined;
        this.max = undefined;
        const { scale } = this;
        scale.clamp = true;
        scale.clamper = clamper;
        this.scale = scale;
        this.datumFormatter = scale.tickFormat({
            ticks: this.getTicks(),
            count: this.calculatedTickCount,
            specifier: this.datumFormat,
        });
    }
    set domain(domain) {
        this.setDomain(domain);
    }
    get domain() {
        return this.scale.domain;
    }
    setDomain(domain, _primaryTickCount) {
        const { scale, nice, min, max, calculatedTickCount } = this;
        if (domain.length > 2) {
            domain = (extent(domain, isContinuous, Number) || [0, 1000]).map((x) => new Date(x));
        }
        if (min instanceof Date) {
            domain = [min, domain[1]];
        }
        if (max instanceof Date) {
            domain = [domain[0], max];
        }
        if (domain[0] > domain[1]) {
            domain = [];
        }
        this.scale.domain = domain;
        if (nice && scale.nice) {
            scale.nice(typeof calculatedTickCount === 'number' ? calculatedTickCount : undefined);
        }
        this.onLabelFormatChange(this.label.format);
    }
    onLabelFormatChange(format) {
        if (format) {
            super.onLabelFormatChange(format);
        }
        else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat({ ticks: this.getTicks(), count: this.calculatedTickCount });
        }
    }
    formatDatum(datum) {
        return this.datumFormatter(datum);
    }
    updateDomain(domain, _isYAxis, primaryTickCount) {
        // the `primaryTickCount` is used to align the secondary axis tick count with the primary
        this.setDomain(domain, primaryTickCount);
        return (primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : this.scale.ticks(this.calculatedTickCount).length);
    }
}
TimeAxis.className = 'TimeAxis';
TimeAxis.type = 'time';
__decorate([
    Validate(BOOLEAN)
], TimeAxis.prototype, "nice", void 0);
__decorate([
    Validate(AND(OPT_DATE, LESS_THAN('max')))
], TimeAxis.prototype, "min", void 0);
__decorate([
    Validate(AND(OPT_DATE, GREATER_THAN('min')))
], TimeAxis.prototype, "max", void 0);
