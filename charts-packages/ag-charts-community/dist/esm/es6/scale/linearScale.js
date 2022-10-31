import { ContinuousScale } from './continuousScale';
import ticks, { tickIncrement } from '../util/ticks';
import { tickFormat } from '../util/numberFormat';
/**
 * Maps continuous domain to a continuous range.
 */
export class LinearScale extends ContinuousScale {
    constructor() {
        super(...arguments);
        this.type = 'linear';
    }
    ticks(count = 10, offset) {
        const d = this._domain;
        count = Math.max(0, count - ((offset !== null && offset !== void 0 ? offset : 0)));
        return ticks(d[0], d[d.length - 1], count);
    }
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    nice(count = 10) {
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
        }
        else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
            step = tickIncrement(start, stop, count);
        }
        if (step > 0) {
            d[i0] = Math.floor(start / step) * step;
            d[i1] = Math.ceil(stop / step) * step;
            this.domain = d;
        }
        else if (step < 0) {
            d[i0] = Math.ceil(start * step) / step;
            d[i1] = Math.floor(stop * step) / step;
            this.domain = d;
        }
    }
    tickFormat({ count, specifier }) {
        const d = this.domain;
        return tickFormat(d[0], d[d.length - 1], count == undefined ? 10 : count, specifier);
    }
}
