import { ContinuousScale } from './continuousScale';
import ticks, { range, tickStep, singleTickDomain } from '../util/ticks';
import { tickFormat } from '../util/numberFormat';

/**
 * Maps continuous domain to a continuous range.
 */
export class LinearScale extends ContinuousScale<number> {
    readonly type = 'linear';

    interval?: number;

    public constructor() {
        super([0, 1], [0, 1]);
    }

    toDomain(d: number): number {
        return d;
    }

    ticks() {
        const count = this.tickCount ?? ContinuousScale.defaultTickCount;
        if (!this.domain || this.domain.length < 2 || count < 1 || this.domain.some((d) => !isFinite(d))) {
            return [];
        }
        this.refresh();
        const [d0, d1] = this.getDomain();

        const { interval } = this;

        if (interval) {
            const step = Math.abs(interval);
            if (!this.isDenseInterval({ start: d0, stop: d1, interval: step })) {
                return range(d0, d1, step);
            }
        }

        return ticks(d0, d1, count, this.minTickCount, this.maxTickCount);
    }

    update() {
        if (!this.domain || this.domain.length < 2) {
            return;
        }
        if (this.nice) {
            this.updateNiceDomain();
        }
    }

    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    protected updateNiceDomain() {
        const count = this.tickCount ?? ContinuousScale.defaultTickCount;
        let [start, stop] = this.domain;
        if (count < 1) {
            this.niceDomain = [start, stop];
            return;
        }

        if (count === 1) {
            this.niceDomain = singleTickDomain(start, stop);
            return;
        }

        const maxAttempts = 4;
        let prev0 = start;
        let prev1 = stop;
        for (let i = 0; i < maxAttempts; i++) {
            const step = this.interval ?? tickStep(start, stop, count, this.minTickCount, this.maxTickCount);
            const [d0, d1] = this.domain;
            if (step >= 1) {
                start = Math.floor(d0 / step) * step;
                stop = Math.ceil(d1 / step) * step;
            } else {
                // Prevent floating point error
                const s = 1 / step;
                start = Math.floor(d0 * s) / s;
                stop = Math.ceil(d1 * s) / s;
            }
            if (start === prev0 && stop === prev1) {
                break;
            }
            prev0 = start;
            prev1 = stop;
        }
        this.niceDomain = [start, stop];
    }

    tickFormat({ ticks, specifier }: { ticks?: any[]; specifier?: string }) {
        return tickFormat(ticks || this.ticks(), specifier);
    }
}
