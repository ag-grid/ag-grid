import { BOOLEAN, Validate, AND, LESS_THAN, GREATER_THAN, OPT_DATE_OR_DATETIME_MS } from '../../util/validation';
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
            count: this.calculatedTickCount,
            specifier: this.datumFormat,
        });
    }

    @Validate(BOOLEAN)
    nice: boolean = true;

    set domain(domain: Date[]) {
        this.setDomain(domain);
    }

    get domain(): Date[] {
        return this.scale.domain;
    }

    @Validate(AND(OPT_DATE_OR_DATETIME_MS, LESS_THAN('max')))
    min?: Date | number = undefined;

    @Validate(AND(OPT_DATE_OR_DATETIME_MS, GREATER_THAN('min')))
    max?: Date | number = undefined;

    private setDomain(domain: Date[], _primaryTickCount?: number) {
        let { scale, nice, min, max, calculatedTickCount } = this;

        if (typeof min === 'number') {
            min = new Date(min);
        }
        if (typeof max === 'number') {
            max = new Date(max);
        }

        if (domain.length > 2) {
            domain = (extent(domain, isContinuous, Number) || [0, 1000]).map((x) => new Date(x));
        }
        if (min instanceof Date) {
            domain = [min, domain[1]];
        }
        if (max instanceof Date) {
            domain = [domain[0], max];
        }
        if (domain[0] > domain[1]) {
            domain = [];
        }

        this.scale.domain = domain;
        if (nice && scale.nice) {
            scale.nice(typeof calculatedTickCount === 'number' ? calculatedTickCount : undefined);
        }

        this.onLabelFormatChange(this.label.format);
    }

    protected onLabelFormatChange(format?: string) {
        if (format) {
            super.onLabelFormatChange(format);
        } else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat({ ticks: this.getTicks(), count: this.calculatedTickCount });
        }
    }

    formatDatum(datum: Date): string {
        return this.datumFormatter(datum);
    }

    protected updateDomain(domain: any[], _isYAxis: boolean, primaryTickCount?: number) {
        // the `primaryTickCount` is used to align the secondary axis tick count with the primary
        this.setDomain(domain, primaryTickCount);
        return primaryTickCount ?? this.scale.ticks(this.calculatedTickCount).length;
    }
}
