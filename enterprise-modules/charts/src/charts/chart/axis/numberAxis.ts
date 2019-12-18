import { LinearScale } from "../../scale/linearScale";
import { ChartAxis } from "../chartAxis";

export class NumberAxis extends ChartAxis {
    constructor() {
        super(new LinearScale());
        (this.scale as LinearScale).clamp = true;
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

    set domain(value: number[]) {
        this.scale.domain = value;
        if (this.nice && this.scale.nice) {
            this.scale.nice(10);
        }
    }
    get domain(): number[] {
        return this.scale.domain;
    }
}
