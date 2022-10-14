import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';
import { ContinuousScale } from '../../scale/continuousScale';
import { LinearScale } from '../../scale/linearScale';
import { filter } from '../../scale/continuousScale';
import { extent } from '../../util/array';
import { isContinuous } from '../../util/value';
import { ChartAxis } from '../chartAxis';
import { doOnce } from '../../util/function';
import { BOOLEAN, predicateWithMessage, Validate, GREATER_THAN, AND, LESS_THAN } from '../../util/validation';

function NUMBER_OR_NAN(min?: number, max?: number) {
    // Can be NaN or finite number
    const message = `expecting a finite Number${
        (min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')
    }`;

    return predicateWithMessage(
        (v: any) =>
            typeof v === 'number' &&
            (isNaN(v) || Number.isFinite(v)) &&
            (min !== undefined ? v >= min : true) &&
            (max !== undefined ? v <= max : true),
        message
    );
}

export class NumberAxis extends ChartAxis {
    static className = 'NumberAxis';
    static type = 'number' as 'number' | 'log';

    constructor() {
        super(new LinearScale());
        (this.scale as ContinuousScale).clamper = filter;
    }

    @Validate(BOOLEAN)
    protected _nice: boolean = true;
    set nice(value: boolean) {
        if (this._nice !== value) {
            this._nice = value;
            if (value && this.scale.nice) {
                this.scale.nice(typeof this.calculatedTickCount === 'number' ? this.calculatedTickCount : undefined);
            }
        }
    }
    get nice(): boolean {
        return this._nice;
    }

    private setDomain(domain: number[], primaryTickCount?: number) {
        const { scale, min, max } = this;

        if (domain.length > 2) {
            domain = extent(domain, isContinuous, Number) || [];
        }

        domain = [isNaN(min) ? domain[0] : min, isNaN(max) ? domain[1] : max];

        if (primaryTickCount) {
            // when `primaryTickCount` is supplied the current axis is a secondary axis which needs to be aligned to
            // the primary by constraining the tick count to the primary axis tick count
            if (isNaN(domain[0]) || isNaN(domain[1])) {
                scale.domain = domain;
                this.ticks = undefined;
                return;
            }

            const [d, ticks] = calculateNiceSecondaryAxis(domain, primaryTickCount);
            scale.domain = d;
            this.ticks = ticks;
        } else {
            scale.domain = domain;

            this.onLabelFormatChange(this.label.format); // not sure why this is required?

            (this.scale as ContinuousScale).clamp = true;
            if (this.nice && this.scale.nice) {
                this.scale.nice(typeof this.calculatedTickCount === 'number' ? this.calculatedTickCount : undefined);
            }
        }
    }

    set domain(domain: number[]) {
        this.setDomain(domain);
    }

    get domain(): number[] {
        return this.scale.domain;
    }

    @Validate(AND(NUMBER_OR_NAN(), LESS_THAN('max')))
    min: number = NaN;

    @Validate(AND(NUMBER_OR_NAN(), GREATER_THAN('min')))
    max: number = NaN;

    formatDatum(datum: number): string {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        } else {
            doOnce(
                () =>
                    console.warn(
                        'AG Charts - Data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.'
                    ),
                `number axis config used with Date objects`
            );
            return String(datum);
        }
    }

    protected updateDomain(domain: any[], isYAxis: boolean, primaryTickCount?: number) {
        const { min, max } = this;

        if (domain.length > 2) {
            domain = extent(domain, isContinuous, Number) || [NaN, NaN];
        }
        if (!isNaN(min)) {
            domain = [min, domain[1]];
        }
        if (!isNaN(max)) {
            domain = [domain[0], max];
        }
        if (domain[0] > domain[1]) {
            domain = [];
        }

        if (isYAxis) {
            // the `primaryTickCount` is used to align the secondary axis tick count with the primary
            this.setDomain(domain, primaryTickCount);
            return primaryTickCount || this.scale.ticks!(this.calculatedTickCount).length;
        }

        return super.updateDomain(domain, isYAxis, primaryTickCount);
    }
}
