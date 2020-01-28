import { TimeScale } from "../../scale/timeScale";
import { ChartAxis } from "../chartAxis";

export class TimeAxis extends ChartAxis {
    static className = 'TimeAxis';
    static type = 'time';

    constructor() {
        super(new TimeScale());
        (this.scale as TimeScale).clamp = true;
    }

    private _nice: boolean = true;
    set nice(value: boolean) {
        if (this._nice !== value) {
            this._nice = value;
            if (value && this.scale.nice) {
                this.scale.nice(10);
            }
        }
    }
    get nice(): boolean {
        return this._nice;
    }

    set domain(value: Date[]) {
        this.scale.domain = value;
        if (this.nice && this.scale.nice) {
            this.scale.nice(10);
        }
    }
    get domain(): Date[] {
        return this.scale.domain;
    }
}
