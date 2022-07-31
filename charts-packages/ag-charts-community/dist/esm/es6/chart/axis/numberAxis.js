import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';
import { LinearScale } from '../../scale/linearScale';
import { extent } from '../../util/array';
import { isContinuous } from '../../util/value';
import { ChartAxis } from '../chartAxis';
import { doOnce } from '../../util/function';
// Instead of clamping the values outside of domain to the range,
// return NaNs to indicate invalid input.
export function clamper(domain) {
    let a = domain[0];
    let b = domain[domain.length - 1];
    if (a > b) {
        [a, b] = [b, a];
    }
    return (x) => (x >= a && x <= b ? x : NaN);
}
export class NumberAxis extends ChartAxis {
    constructor() {
        super(new LinearScale());
        this._nice = true;
        this._min = NaN;
        this._max = NaN;
        this.scale.clamper = clamper;
    }
    set nice(value) {
        if (this._nice !== value) {
            this._nice = value;
            if (value && this.scale.nice) {
                this.scale.nice(typeof this.calculatedTickCount === 'number' ? this.calculatedTickCount : undefined);
            }
        }
    }
    get nice() {
        return this._nice;
    }
    setDomain(domain, primaryTickCount) {
        const { scale, min, max } = this;
        if (domain.length > 2) {
            domain = extent(domain, isContinuous, Number) || [];
        }
        domain = [isNaN(min) ? domain[0] : min, isNaN(max) ? domain[1] : max];
        if (primaryTickCount) {
            // when `primaryTickCount` is supplied the current axis is a secondary axis which needs to be aligned to
            // the primary by constraining the tick count to the primary axis tick count
            const [d, ticks] = calculateNiceSecondaryAxis(domain, primaryTickCount);
            scale.domain = d;
            this.ticks = ticks;
            return;
        }
        else {
            scale.domain = domain;
            this.onLabelFormatChange(this.label.format); // not sure why this is required?
            this.scale.clamp = true;
            if (this.nice && this.scale.nice) {
                this.scale.nice(typeof this.calculatedTickCount === 'number' ? this.calculatedTickCount : undefined);
            }
        }
    }
    set domain(domain) {
        this.setDomain(domain);
    }
    get domain() {
        return this.scale.domain;
    }
    set min(value) {
        if (this._min !== value) {
            this._min = value;
            if (!isNaN(value)) {
                this.scale.domain = [value, this.scale.domain[1]];
            }
        }
    }
    get min() {
        return this._min;
    }
    set max(value) {
        if (this._max !== value) {
            this._max = value;
            if (!isNaN(value)) {
                this.scale.domain = [this.scale.domain[0], value];
            }
        }
    }
    get max() {
        return this._max;
    }
    formatDatum(datum) {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        }
        else {
            doOnce(() => console.warn('AG Charts - Data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.'), `number axis config used with Date objects`);
            return String(datum);
        }
    }
    updateDomain(domain, isYAxis, primaryTickCount) {
        if (isYAxis) {
            // the `primaryTickCount` is used to align the secondary axis tick count with the primary
            this.setDomain(domain, primaryTickCount);
            return (primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : this.scale.ticks(this.calculatedTickCount).length);
        }
        return super.updateDomain(domain, isYAxis, primaryTickCount);
    }
}
NumberAxis.className = 'NumberAxis';
NumberAxis.type = 'number';
