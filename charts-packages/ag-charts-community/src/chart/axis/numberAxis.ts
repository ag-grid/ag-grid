import ContinuousScale from "../../scale/continuousScale";
import { LinearScale } from "../../scale/linearScale";
import { extent } from "../../util/array";
import { isContinuous } from "../../util/value";
import { ChartAxis } from "../chartAxis";

export function clamper(domain: number[]): (x: number) => number {
    let a = domain[0];
    let b = domain[domain.length - 1];

    if (a > b) {
        [a, b] = [b, a];
    }

    return x => x >= a && x <= b ? x : NaN;
}

export class NumberAxis extends ChartAxis {
    static className = 'NumberAxis';
    static type = 'number';

    constructor() {
        super(new LinearScale());
        (this.scale as ContinuousScale).clamper = clamper;
    }

    protected _nice: boolean = true;
    set nice(value: boolean) {
        if (this._nice !== value) {
            this._nice = value;
            if (value && this.scale.nice) {
                this.scale.nice(this.tick.count);
            }
        }
    }
    get nice(): boolean {
        return this._nice;
    }

    set domain(domain: number[]) {
        if (domain.length > 2) {
            domain = extent(domain, isContinuous, Number) || [0, 1];
        }
        const { scale, min, max } = this;
        domain = [
            isNaN(min) ? domain[0] : min,
            isNaN(max) ? domain[1] : max
        ];
        scale.domain = domain;
        this.onLabelFormatChange(this.label.format);
        (scale as ContinuousScale).clamp = true;
        if (this.nice && this.scale.nice) {
            this.scale.nice(this.tick.count);
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

    formatDatum(datum: number): string {
        return datum.toFixed(2);
    }
}
