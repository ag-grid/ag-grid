import { Axis } from "../../axis";
import timeScale, { TimeScale } from "../../scale/timeScale";

export class TimeAxis extends Axis<TimeScale> {
    constructor() {
        super(timeScale());
        this.scale.clamp = true;
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
