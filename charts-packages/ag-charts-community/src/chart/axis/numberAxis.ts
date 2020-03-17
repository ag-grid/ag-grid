import { LinearScale } from "../../scale/linearScale";
import { ChartAxis } from "../chartAxis";

export class NumberAxis extends ChartAxis {
    static className = 'NumberAxis';
    static type = 'number';

    constructor() {
        super(new LinearScale());
        (this.scale as LinearScale).clamp = true;
    }

    protected _nice: boolean = true;
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
        const { min, max } = this;
        value = [
            isNaN(min) ? value[0] : min,
            isNaN(max) ? value[1] : max
        ];
        this.scale.domain = value;
        if (this.nice && this.scale.nice) {
            this.scale.nice(10);
        }
    }
    get domain(): number[] {
        return this.scale.domain;
    }

    protected _min: number = NaN;
    set min(value: number) {
        if (this._min !== value) {
            this._min = value;
            if (!isNaN(value)) {
                this.scale.domain = [value, this.scale.domain[1]];
            }
        }
    }
    get min(): number {
        return this._min;
    }

    protected _max: number = NaN;
    set max(value: number) {
        if (this._max !== value) {
            this._max = value;
            if (!isNaN(value)) {
                this.scale.domain = [this.scale.domain[0], value];
            }
        }
    }
    get max(): number {
        return this._max;
    }
}
