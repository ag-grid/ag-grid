"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timeScale_1 = require("../../scale/timeScale");
const array_1 = require("../../util/array");
const value_1 = require("../../util/value");
const chartAxis_1 = require("../chartAxis");
class TimeAxis extends chartAxis_1.ChartAxis {
    constructor() {
        super(new timeScale_1.TimeScale());
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
            domain = (array_1.extent(domain, value_1.isContinuous, Number) || [0, 1000]).map(x => new Date(x));
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
exports.TimeAxis = TimeAxis;
TimeAxis.className = 'TimeAxis';
TimeAxis.type = 'time';
//# sourceMappingURL=timeAxis.js.map