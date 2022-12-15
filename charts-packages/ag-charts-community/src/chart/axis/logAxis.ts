import { LogScale } from '../../scale/logScale';
import { NumberAxis } from './numberAxis';

export class LogAxis extends NumberAxis {
    static className = 'LogAxis';
    static type = 'log' as const;

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
