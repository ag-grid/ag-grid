var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AND, GREATER_THAN, LESS_THAN, NUMBER_OR_NAN, predicateWithMessage, Validate } from '../../util/validation';
import { Default } from '../../util/default';
import { LogScale } from '../../scale/logScale';
import { NumberAxis } from './numberAxis';
import { extent } from '../../util/array';
import { Logger } from '../../util/logger';
function NON_ZERO_NUMBER() {
    // Cannot be 0
    const message = `expecting a non-zero Number`;
    return predicateWithMessage((v) => typeof v === 'number' && v !== 0, message);
}
export class LogAxis extends NumberAxis {
    constructor(moduleCtx) {
        super(moduleCtx, new LogScale());
        this.min = NaN;
        this.max = NaN;
        this.scale.strictClampByDefault = true;
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
        const isInverted = d[0] > d[1];
        const crossesZero = d[0] < 0 && d[1] > 0;
        const hasZeroExtent = d[0] === 0 && d[1] === 0;
        const invalidDomain = isInverted || crossesZero || hasZeroExtent;
        if (invalidDomain) {
            d = [];
            if (crossesZero) {
                Logger.warn(`the data domain crosses zero, the chart data cannot be rendered. See log axis documentation for more information.`);
            }
            else if (hasZeroExtent) {
                Logger.warn(`the data domain has 0 extent, no data is rendered.`);
            }
        }
        if (d[0] === 0) {
            d[0] = 1;
        }
        if (d[1] === 0) {
            d[1] = -1;
        }
        return d;
    }
    set base(value) {
        this.scale.base = value;
    }
    get base() {
        return this.scale.base;
    }
}
LogAxis.className = 'LogAxis';
LogAxis.type = 'log';
__decorate([
    Validate(AND(NUMBER_OR_NAN(), LESS_THAN('max'), NON_ZERO_NUMBER())),
    Default(NaN)
], LogAxis.prototype, "min", void 0);
__decorate([
    Validate(AND(NUMBER_OR_NAN(), GREATER_THAN('min'), NON_ZERO_NUMBER())),
    Default(NaN)
], LogAxis.prototype, "max", void 0);
