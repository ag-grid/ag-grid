var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LinearScale } from '../../scale/linearScale';
import { extent } from '../../util/array';
import { ChartAxis } from '../chartAxis';
import { doOnce } from '../../util/function';
import { Validate, GREATER_THAN, AND, LESS_THAN, NUMBER_OR_NAN } from '../../util/validation';
import { Default } from '../../util/default';
import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';
export class NumberAxis extends ChartAxis {
    constructor(scale = new LinearScale()) {
        super(scale);
        this.min = NaN;
        this.max = NaN;
        scale.strictClampByDefault = true;
    }
    normaliseDataDomain(d) {
        const { min, max } = this;
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
    }
    formatDatum(datum) {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        }
        else {
            doOnce(() => console.warn('AG Charts - Data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.'), `number axis config used with Date objects`);
            return String(datum);
        }
    }
    updateSecondaryAxisTicks(primaryTickCount) {
        if (this.dataDomain == null) {
            throw new Error('AG Charts - dataDomain not calculated, cannot perform tick calculation.');
        }
        const [d, ticks] = calculateNiceSecondaryAxis(this.dataDomain, primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : 0);
        this.scale.nice = false;
        this.scale.domain = d;
        this.scale.update();
        return ticks;
    }
}
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
