import { AND, GREATER_THAN, LESS_THAN, NUMBER_OR_NAN, Validate } from '../../util/validation';
import { LogScale } from '../../scale/logScale';
import { NumberAxis } from './numberAxis';
import { extent } from '../../util/array';

export class LogAxis extends NumberAxis {
    static className = 'LogAxis';
    static type = 'log' as const;

    normaliseDataDomain(d: number[]) {
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
        }
        if (d[0] === 0) {
            d[0] = 1;
        }
        if (d[1] === 0) {
            d[1] = -1;
        }

        return d;
    }

    @Validate(AND(NUMBER_OR_NAN(1), LESS_THAN('max')))
    min: number = NaN;

    @Validate(AND(NUMBER_OR_NAN(1), GREATER_THAN('min')))
    max: number = NaN;

    set base(value: number) {
        (this.scale as LogScale).base = value;
    }
    get base(): number {
        return (this.scale as LogScale).base;
    }

    constructor() {
        super(new LogScale());
        this.scale.strictClampByDefault = true;
    }
}
