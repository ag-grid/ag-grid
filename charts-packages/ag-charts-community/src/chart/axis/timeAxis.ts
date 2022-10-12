import { Validate, AND, LESS_THAN, GREATER_THAN, OPT_DATE_OR_DATETIME_MS } from '../../util/validation';
import { TimeScale } from '../../scale/timeScale';
import { extent } from '../../util/array';
import { isContinuous } from '../../util/value';
import { ChartAxis } from '../chartAxis';
import { clamper } from './numberAxis';

export class TimeAxis extends ChartAxis<TimeScale> {
    static className = 'TimeAxis';
    static type = 'time' as const;

    private datumFormat = '%m/%d/%y, %H:%M:%S';
    private datumFormatter: (date: Date) => string;

    constructor() {
        super(new TimeScale());

        const { scale } = this;
        scale.clamp = true;
        scale.clamper = clamper;
        this.scale = scale;
        this.datumFormatter = scale.tickFormat({
            ticks: this.getTicks(),
            specifier: this.datumFormat,
        });
    }

    @Validate(AND(OPT_DATE_OR_DATETIME_MS, LESS_THAN('max')))
    min?: Date | number = undefined;

    @Validate(AND(OPT_DATE_OR_DATETIME_MS, GREATER_THAN('min')))
    max?: Date | number = undefined;

    normaliseDataDomain(d: Date[]) {
        let { min, max } = this;

        if (typeof min === 'number') {
            min = new Date(min);
        }
        if (typeof max === 'number') {
            max = new Date(max);
        }

        if (d.length > 2) {
            d = (extent(d, isContinuous, Number) || [0, 1000]).map((x) => new Date(x));
        }
        if (min instanceof Date) {
            d = [min, d[1]];
        }
        if (max instanceof Date) {
            d = [d[0], max];
        }
        if (d[0] > d[1]) {
            d = [];
        }

        return d;
    }

    protected onLabelFormatChange(format?: string, ticks?: any[]) {
        if (format) {
            super.onLabelFormatChange(format);
        } else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat({
                ticks: ticks ?? this.getTicks(),
            });
        }
    }

    formatDatum(datum: Date): string {
        return this.datumFormatter(datum);
    }
}
