import { ContinuousScale } from "../../scale/continuousScale";
import { LinearScale } from "../../scale/linearScale";
import { extent } from "../../util/array";
import { isContinuous } from "../../util/value";
import { ChartAxis } from "../chartAxis";

// Instead of clamping the values outside of domain to the range,
// return NaNs to indicate invalid input.
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

    calculateNextNiceStep(rawStep: number): number {
        let step = rawStep;

        const order = Math.floor(Math.log10(rawStep));
        const magnitude = Math.pow(10, order);

        // Make order 1
        step = (step / magnitude) * 10;

        if (step > 0 && step <= 1) {
            step = 1 * magnitude / 10;
        } else if (step > 1 && step <= 2) {
            step = 2 * magnitude / 10;
        } else if (step > 1 && step <= 5) {
            step = 5 * magnitude / 10;
        } else if (step > 5 && step <= 10) {
            step = 10 * magnitude / 10;
        } else if (step > 10 && step <= 20) {
            step = 20 * magnitude / 10;
        } else if (step > 20 && step <= 40) {
            step = 40 * magnitude / 10;
        } else if (step > 40 && step <= 50) {
            step = 50 * magnitude / 10;
        } else if (step > 50 && step <= 100) {
            step = 100 * magnitude / 10;
        }

        return step;
    }

    calculateNiceStart(a: number, b: number, count: number): number {
        const rawStep = Math.abs(b - a) / (count - 1);
        const order = Math.floor(Math.log10(rawStep));
        const magnitude = Math.pow(10, order);

        return Math.floor(a / magnitude) * magnitude;
    }

    getTicks(start: number, step: number, count: number): number[] {
        const ticks = [];

        // power of the step will be negative if the step is a fraction (between 0 and 1)
        const stepPower = Math.floor(Math.log10(step));
        const fractionDigits = (step > 0 && step < 1)
            ? Math.abs(stepPower)
            : 0;

        const f = Math.pow(10, fractionDigits);

        for (let i = 0; i < count; i++) {
            const tick = start + step * i;
            ticks[i] = Math.round(tick * f) / f;
        }

        return ticks;
    }

    getTickStep(start: number, stop: number, count: number): number {
        const segments = count - 1;
        const rawStep = (stop - start) / segments;
        return this.calculateNextNiceStep(rawStep);
    }


    calculateDomain(domain: number[], primaryTickCount?: number): number[] {
        if (domain.length > 2) {
            domain = extent(domain, isContinuous, Number) || [0, 1];
        }
        const { scale, min, max } = this;
        domain = [
            isNaN(min) ? domain[0] : min,
            isNaN(max) ? domain[1] : max
        ];

        if (!primaryTickCount) {
            // If this is a primary axis
            scale.domain = domain;

            this.onLabelFormatChange(this.label.format);

            (this.scale as ContinuousScale).clamp = true;
            if (this.nice && this.scale.nice) {
                this.scale.nice(this.tick.count);
            }
        } else {
            // Make secondary axis domain nice using strict tick count, matching the tick count from the primary axis.
            // This is to make the secondary axis grid lines/ tick positions align with the ones from the primary axis.
            let start = Math.floor(domain[0]);
            let stop = Math.ceil(domain[1]);

            start = this.calculateNiceStart(start, stop, primaryTickCount);
            const step = this.getTickStep(start, stop, primaryTickCount);

            const segments = primaryTickCount - 1;
            stop = start + (segments * step);

            scale.domain = [start, stop];

            this.ticks = this.getTicks(start, step, primaryTickCount);
        }

        return domain;
    }

    set domain(domain: number[]) {
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
