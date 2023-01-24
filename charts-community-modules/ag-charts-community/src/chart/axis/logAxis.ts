import { AND, GREATER_THAN, LESS_THAN, NUMBER_OR_NAN, Validate } from '../../util/validation';
import { LogScale } from '../../scale/logScale';
import { NumberAxis } from './numberAxis';

export class LogAxis extends NumberAxis {
    static className = 'LogAxis';
    static type = 'log' as const;

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
