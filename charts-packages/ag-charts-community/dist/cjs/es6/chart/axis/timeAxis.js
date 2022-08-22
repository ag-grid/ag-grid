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
        this._domain = [];
        const { scale } = this;
        scale.clamp = true;
        this.scale = scale;
        this.datumFormatter = scale.tickFormat({
            ticks: this.getTicks(),
            count: this.calculatedTickCount,
            specifier: this.datumFormat,
        });
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
    set domain(domain) {
        this._domain = domain;
        this.setDomain(domain);
    }
    get domain() {
        return this.scale.domain;
    }
    setDomain(domain, _primaryTickCount) {
        const { scale, nice, _domain: [min, max], calculatedTickCount, } = this;
        if (domain.length > 2) {
            domain = (array_1.extent(domain, value_1.isContinuous, Number) || [0, 1000]).map((x) => new Date(x));
        }
        domain = [min instanceof Date ? min : domain[0], max instanceof Date ? max : domain[1]];
        this.scale.domain = domain;
        if (nice && scale.nice) {
            scale.nice(typeof calculatedTickCount === 'number' ? calculatedTickCount : undefined);
        }
        this.onLabelFormatChange(this.label.format);
    }
    onLabelFormatChange(format) {
        if (format) {
            super.onLabelFormatChange(format);
        }
        else {
            // For time axis labels to look nice, even if date format wasn't set.
            this.labelFormatter = this.scale.tickFormat({ ticks: this.getTicks(), count: this.calculatedTickCount });
        }
    }
    formatDatum(datum) {
        return this.datumFormatter(datum);
    }
    updateDomain(domain, _isYAxis, primaryTickCount) {
        // the `primaryTickCount` is used to align the secondary axis tick count with the primary
        this.setDomain(domain, primaryTickCount);
        return (primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : this.scale.ticks(this.calculatedTickCount).length);
    }
}
exports.TimeAxis = TimeAxis;
TimeAxis.className = 'TimeAxis';
TimeAxis.type = 'time';
