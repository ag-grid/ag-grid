import { Axis } from "../../axis";
import linearScale from "../../scale/linearScale";
import { AxisOptions, applyAxisOptions } from "./axisOptions";

export class NumberAxis extends Axis<number> {
    constructor(options: AxisOptions = {}) {
        super(linearScale());

        applyAxisOptions(this, options);
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
