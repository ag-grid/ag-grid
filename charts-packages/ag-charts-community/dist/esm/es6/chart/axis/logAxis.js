import { LogScale } from '../../scale/logScale';
import { NumberAxis } from './numberAxis';
export class LogAxis extends NumberAxis {
    constructor() {
        super(new LogScale());
        this.scale.strictClampByDefault = true;
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
