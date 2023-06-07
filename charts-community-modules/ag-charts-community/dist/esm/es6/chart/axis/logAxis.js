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
        var _a;
        const { min, max } = this;
        if (d.length > 2) {
            d = (_a = extent(d)) !== null && _a !== void 0 ? _a : [NaN, NaN];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nQXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9heGlzL2xvZ0F4aXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNwSCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUczQyxTQUFTLGVBQWU7SUFDcEIsY0FBYztJQUNkLE1BQU0sT0FBTyxHQUFHLDZCQUE2QixDQUFDO0lBRTlDLE9BQU8sb0JBQW9CLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZGLENBQUM7QUFFRCxNQUFNLE9BQU8sT0FBUSxTQUFRLFVBQVU7SUF5RG5DLFlBQVksU0FBd0I7UUFDaEMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFkckMsUUFBRyxHQUFXLEdBQUcsQ0FBQztRQUlsQixRQUFHLEdBQVcsR0FBRyxDQUFDO1FBV2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7SUFDM0MsQ0FBQztJQXhERCxtQkFBbUIsQ0FBQyxDQUFXOztRQUMzQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FB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