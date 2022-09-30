"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const secondaryAxisTicks_1 = require("../../util/secondaryAxisTicks");
const linearScale_1 = require("../../scale/linearScale");
const array_1 = require("../../util/array");
const value_1 = require("../../util/value");
const chartAxis_1 = require("../chartAxis");
const function_1 = require("../../util/function");
const validation_1 = require("../../util/validation");
function NUMBER_OR_NAN(min, max) {
    // Can be NaN or finite number
    const message = `expecting a finite Number${(min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')}`;
    return validation_1.predicateWithMessage((v) => typeof v === 'number' &&
        (isNaN(v) || Number.isFinite(v)) &&
        (min !== undefined ? v >= min : true) &&
        (max !== undefined ? v <= max : true), message);
}
// Instead of clamping the values outside of domain to the range,
// return NaNs to indicate invalid input.
function clamper(domain) {
    let a = domain[0];
    let b = domain[domain.length - 1];
    if (a > b) {
        [a, b] = [b, a];
    }
    return (x) => (x >= a && x <= b ? x : NaN);
}
exports.clamper = clamper;
class NumberAxis extends chartAxis_1.ChartAxis {
    constructor() {
        super(new linearScale_1.LinearScale());
        this._nice = true;
        this.min = NaN;
        this.max = NaN;
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
            domain = array_1.extent(domain, value_1.isContinuous, Number) || [];
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
            const [d, ticks] = secondaryAxisTicks_1.calculateNiceSecondaryAxis(domain, primaryTickCount);
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
    formatDatum(datum) {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        }
        else {
            function_1.doOnce(() => console.warn('AG Charts - Data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.'), `number axis config used with Date objects`);
            return String(datum);
        }
    }
    updateDomain(domain, isYAxis, primaryTickCount) {
        const { min, max } = this;
        if (domain.length > 2) {
            domain = array_1.extent(domain, value_1.isContinuous, Number) || [NaN, NaN];
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
            return primaryTickCount || this.scale.ticks(this.calculatedTickCount).length;
        }
        return super.updateDomain(domain, isYAxis, primaryTickCount);
    }
}
NumberAxis.className = 'NumberAxis';
NumberAxis.type = 'number';
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], NumberAxis.prototype, "_nice", void 0);
__decorate([
    validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.LESS_THAN('max')))
], NumberAxis.prototype, "min", void 0);
__decorate([
    validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.GREATER_THAN('min')))
], NumberAxis.prototype, "max", void 0);
exports.NumberAxis = NumberAxis;
