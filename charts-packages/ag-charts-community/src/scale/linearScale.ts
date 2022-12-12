import { ContinuousScale } from './continuousScale';
import ticks, { tickIncrement } from '../util/ticks';
import { tickFormat } from '../util/numberFormat';

/**
 * Maps continuous domain to a continuous range.
 */
export class LinearScale extends ContinuousScale {
    readonly type = 'linear';

    ticks() {
        if (!this.domain || this.domain.length < 2) {
            return [];
        }
        this.refresh();
        const d = this.getDomain();
        const count = this.tickCount ?? 10;
        return ticks(d[0], d[d.length - 1], count);
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
        const count = this.tickCount ?? 10;
        const d = this.domain;
        let i0 = 0;
        let i1 = d.length - 1;
        let start = d[i0];
        let stop = d[i1];
        let step;

        if (stop < start) {
            step = start;
            start = stop;
            stop = step;

            step = i0;
            i0 = i1;
            i1 = step;
        }

        step = tickIncrement(start, stop, count);

        if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
            step = tickIncrement(start, stop, count);
        } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
            step = tickIncrement(start, stop, count);
        }

        if (step > 0) {
            d[i0] = Math.floor(start / step) * step;
            d[i1] = Math.ceil(stop / step) * step;
            this.niceDomain = d;
        } else if (step < 0) {
            d[i0] = Math.ceil(start * step) / step;
            d[i1] = Math.floor(stop * step) / step;
            this.niceDomain = d;
        }
    }

    tickFormat({ count, specifier }: { count?: number; ticks?: any[]; specifier?: string }) {
        const d = this.getDomain();
        return tickFormat(d[0], d[d.length - 1], count ?? 10, specifier);
    }
}
