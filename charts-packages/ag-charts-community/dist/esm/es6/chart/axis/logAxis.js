import { LogScale } from '../../scale/logScale';
import { NumberAxis, clamper } from './numberAxis';
export class LogAxis extends NumberAxis {
    constructor() {
        super();
        this.scale = new LogScale();
        this.scale.clamper = clamper;
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
