import { ContinuousScale } from '../../scale/continuousScale';
import { LinearScale } from '../../scale/linearScale';
import { extent } from '../../util/array';
import { isContinuous } from '../../util/value';
import { ChartAxis } from '../chartAxis';
import { doOnce } from '../../util/function';
import { predicateWithMessage, Validate, GREATER_THAN, AND, LESS_THAN } from '../../util/validation';

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

// Instead of clamping the values outside of domain to the range,
// return NaNs to indicate invalid input.
export function clamper(domain: number[]): (x: number) => number {
    let a = domain[0];
    let b = domain[domain.length - 1];

    if (a > b) {
        [a, b] = [b, a];
    }

    return (x) => (x >= a && x <= b ? x : NaN);
}

export class NumberAxis extends ChartAxis {
    static className = 'NumberAxis';
    static type = 'number' as 'number' | 'log';

    constructor() {
        super(new LinearScale());
        (this.scale as ContinuousScale).clamper = clamper;
    }

    private setDomain(domain: number[]) {
        const { scale, min, max } = this;

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

        scale.domain = domain;

        this.onLabelFormatChange(this.label.format); // not sure why this is required?

        (this.scale as ContinuousScale).clamp = true;
        if (this.nice && this.scale.nice) {
            this.scale.nice(this.tick.count);
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
}
