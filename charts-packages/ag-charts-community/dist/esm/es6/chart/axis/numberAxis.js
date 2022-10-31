var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { filter } from '../../scale/continuousScale';
import { LinearScale } from '../../scale/linearScale';
import { extent } from '../../util/array';
import { isContinuous } from '../../util/value';
import { ChartAxis } from '../chartAxis';
import { doOnce } from '../../util/function';
import { predicateWithMessage, Validate, GREATER_THAN, AND, LESS_THAN } from '../../util/validation';
import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';
function NUMBER_OR_NAN(min, max) {
    // Can be NaN or finite number
    const message = `expecting a finite Number${(min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')}`;
    return predicateWithMessage((v) => typeof v === 'number' &&
        (isNaN(v) || Number.isFinite(v)) &&
        (min !== undefined ? v >= min : true) &&
        (max !== undefined ? v <= max : true), message);
}
export class NumberAxis extends ChartAxis {
    constructor(scale = new LinearScale()) {
        super(scale);
        this.min = NaN;
        this.max = NaN;
        this.scale.clamper = filter;
    }
    normaliseDataDomain(d) {
        const { min, max } = this;
        if (d.length > 2) {
            d = extent(d, isContinuous, Number) || [NaN, NaN];
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
        this.scale.clamp = true;
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
        const [d, ticks] = calculateNiceSecondaryAxis(this.dataDomain, (primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : 0));
        this.scale.domain = d;
        return ticks;
    }
}
NumberAxis.className = 'NumberAxis';
NumberAxis.type = 'number';
__decorate([
    Validate(AND(NUMBER_OR_NAN(), LESS_THAN('max')))
], NumberAxis.prototype, "min", void 0);
__decorate([
    Validate(AND(NUMBER_OR_NAN(), GREATER_THAN('min')))
], NumberAxis.prototype, "max", void 0);
