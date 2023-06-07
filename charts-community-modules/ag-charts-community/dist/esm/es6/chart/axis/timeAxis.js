var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validate, AND, LESS_THAN, GREATER_THAN, OPT_DATE_OR_DATETIME_MS, NUMBER_OR_NAN } from '../../util/validation';
import { TimeScale } from '../../scale/timeScale';
import { extent } from '../../util/array';
import { ChartAxis } from '../chartAxis';
import { Default } from '../../util/default';
import { BaseAxisTick } from '../../axis';
class TimeAxisTick extends BaseAxisTick {
    constructor() {
        super(...arguments);
        this.maxSpacing = NaN;
    }
}
__decorate([
    Validate(AND(NUMBER_OR_NAN(1), GREATER_THAN('minSpacing'))),
    Default(NaN)
], TimeAxisTick.prototype, "maxSpacing", void 0);
export class TimeAxis extends ChartAxis {
    constructor(moduleCtx) {
        super(moduleCtx, new TimeScale());
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
        var _a;
        let { min, max } = this;
        if (typeof min === 'number') {
            min = new Date(min);
        }
        if (typeof max === 'number') {
            max = new Date(max);
        }
        if (d.length > 2) {
            d = ((_a = extent(d)) !== null && _a !== void 0 ? _a : [0, 1000]).map((x) => new Date(x));
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
    createTick() {
        return new TimeAxisTick();
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
        var _a;
        return (_a = this.moduleCtx.callbackCache.call(this.datumFormatter, datum)) !== null && _a !== void 0 ? _a : String(datum);
    }
    calculatePadding(_min, _max) {
        // numbers in domain correspond to Unix timestamps
        // automatically expand domain by 1 in each direction
        return 1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZUF4aXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvYXhpcy90aW1lQXhpcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLHVCQUF1QixFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3ZILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUxQyxNQUFNLFlBQWEsU0FBUSxZQUFzQztJQUFqRTs7UUFHSSxlQUFVLEdBQVcsR0FBRyxDQUFDO0lBQzdCLENBQUM7Q0FBQTtBQURHO0lBRkMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQztnREFDWTtBQUc3QixNQUFNLE9BQU8sUUFBUyxTQUFRLFNBQW1DO0lBTzdELFlBQVksU0FBd0I7UUFDaEMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFKOUIsZ0JBQVcsR0FBRyxvQkFBb0IsQ0FBQztRQWdCM0MsUUFBRyxHQUFtQixTQUFTLENBQUM7UUFHaEMsUUFBRyxHQUFtQixTQUFTLENBQUM7UUFiNUIsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztRQUN2QixLQUFLLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1FBQ2xD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