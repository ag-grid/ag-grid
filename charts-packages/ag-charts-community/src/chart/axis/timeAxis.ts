import { TimeScale } from "../../scale/timeScale";
import { numericExtent } from "../../util/array";
import { ChartAxis } from "../chartAxis";

export class TimeAxis extends ChartAxis<TimeScale> {
    static className = 'TimeAxis';
    static type = 'time';

    private datumFormat = '%m/%d/%y, %H:%M:%S';
    private datumFormatter: (date: Date) => string;

    constructor() {
        super();

        const scale = new TimeScale();
        scale.clamp = true;
        this.scale = scale;
        this.datumFormatter = scale.tickFormat(this.tick.count, this.datumFormat);
    }

    private _nice: boolean = true;
    set nice(value: boolean) {
        if (this._nice !== value) {
            this._nice = value;
            if (value && this.scale.nice) {
                this.scale.nice(10);
            }
        }
    }
    get nice(): boolean {
        return this._nice;
    }

    set domain(domain: Date[]) {
        if (domain.length > 2) {
            domain = (numericExtent(domain) || [0, 1000]).map(x => new Date(x));
        }
        this.scale.domain = domain;
        if (this.nice && this.scale.nice) {
            this.scale.nice(10);
        }
    }
    get domain(): Date[] {
        return this.scale.domain;
    }

    protected onLabelFormatChange(format?: string) {
        if (format) {
            super.onLabelFormatChange(format);
        } else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat(this.tick.count, undefined);
        }
    }

    formatDatum(datum: Date): string {
        return this.datumFormatter(datum);
    }
}
