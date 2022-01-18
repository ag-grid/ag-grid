import { ContinuousScale } from "../../scale/continuousScale";
import { LogScale } from "../../scale/logScale";
import { NumberAxis, clamper } from "./numberAxis";

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
        super();

        this.scale = new LogScale();
        (this.scale as ContinuousScale).clamper = clamper;
    }
}