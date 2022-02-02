import { TimeScale } from "../../scale/timeScale";
import { extent } from "../../util/array";
import { isContinuous } from "../../util/value";
import { ChartAxis } from "../chartAxis";
export class TimeAxis extends ChartAxis {
    constructor() {
        super(new TimeScale());
        this.datumFormat = '%m/%d/%y, %H:%M:%S';
        this._nice = true;
        const { scale } = this;
        scale.clamp = true;
        this.scale = scale;
        this.datumFormatter = scale.tickFormat(this.tick.count, this.datumFormat);
    }
    set nice(value) {
        if (this._nice !== value) {
            this._nice = value;
            if (value && this.scale.nice) {
                this.scale.nice(10);
            }
        }
    }
    get nice() {
        return this._nice;
    }
    set domain(domain) {
        if (domain.length > 2) {
            domain = (extent(domain, isContinuous, Number) || [0, 1000]).map(x => new Date(x));
        }
        this.scale.domain = domain;
        if (this.nice && this.scale.nice) {
            this.scale.nice(10);
        }
    }
    get domain() {
        return this.scale.domain;
    }
    onLabelFormatChange(format) {
        if (format) {
            super.onLabelFormatChange(format);
        }
        else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat(this.tick.count, undefined);
        }
    }
    formatDatum(datum) {
        return this.datumFormatter(datum);
    }
}
TimeAxis.className = 'TimeAxis';
TimeAxis.type = 'time';
//# sourceMappingURL=timeAxis.js.map