var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LinearScale } from '../../scale/linearScale.mjs';
import { normalisedExtent } from '../../util/array.mjs';
import { Validate, GREATER_THAN, AND, LESS_THAN, NUMBER_OR_NAN } from '../../util/validation.mjs';
import { Default } from '../../util/default.mjs';
import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks.mjs';
import { Logger } from '../../util/logger.mjs';
import { AxisTick } from './axisTick.mjs';
import { CartesianAxis } from './cartesianAxis.mjs';
class NumberAxisTick extends AxisTick {
    constructor() {
        super(...arguments);
        this.maxSpacing = NaN;
    }
}
__decorate([
    Validate(AND(NUMBER_OR_NAN(1), GREATER_THAN('minSpacing'))),
    Default(NaN)
], NumberAxisTick.prototype, "maxSpacing", void 0);
export class NumberAxis extends CartesianAxis {
    constructor(moduleCtx, scale = new LinearScale()) {
        super(moduleCtx, scale);
        this.min = NaN;
        this.max = NaN;
        scale.strictClampByDefault = true;
    }
    normaliseDataDomain(d) {
        const { min, max } = this;
        return normalisedExtent(d, min, max);
    }
    formatDatum(datum) {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        }
        else {
            Logger.warnOnce('data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.');
            return String(datum);
        }
    }
    createTick() {
        return new NumberAxisTick();
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
