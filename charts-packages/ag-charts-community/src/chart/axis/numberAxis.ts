import { LinearScale } from '../../scale/linearScale';
import { LogScale } from '../../scale/logScale';
import { extent } from '../../util/array';
import { isContinuous } from '../../util/value';
import { ChartAxis } from '../chartAxis';
import { doOnce } from '../../util/function';
import { predicateWithMessage, Validate, GREATER_THAN, AND, LESS_THAN } from '../../util/validation';
import { calculateNiceSecondaryAxis } from '../../util/secondaryAxisTicks';

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

export class NumberAxis extends ChartAxis<LinearScale | LogScale, number> {
    static className = 'NumberAxis';
    static type = 'number' as 'number' | 'log';

    constructor(scale = new LinearScale() as LinearScale | LogScale) {
        super(scale);
        scale.strictClampByDefault = true;
    }

    normaliseDataDomain(d: number[]) {
        const { min, max } = this;

        if (d.length > 2) {
            d = extent(d, isContinuous, Number) || [NaN, NaN];
        }
        if (!isNaN(min)) {
            d = [min, d[1]];
        }
        if (!isNaN(max)) {
            d = [d[0], max];
        }
        if (d[0] > d[1]) {
            d = [];
        }

        return d;
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

    updateSecondaryAxisTicks(primaryTickCount: number | undefined): any[] {
        if (this.dataDomain == null) {
            throw new Error('AG Charts - dataDomain not calculated, cannot perform tick calculation.');
        }

        const [d, ticks] = calculateNiceSecondaryAxis(this.dataDomain, primaryTickCount ?? 0);

        this.scale.nice = false;
        this.scale.domain = d;
        this.scale.update();

        return ticks;
    }
}
