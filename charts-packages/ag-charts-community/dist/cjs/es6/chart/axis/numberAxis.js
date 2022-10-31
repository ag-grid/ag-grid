"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const continuousScale_1 = require("../../scale/continuousScale");
const linearScale_1 = require("../../scale/linearScale");
const array_1 = require("../../util/array");
const value_1 = require("../../util/value");
const chartAxis_1 = require("../chartAxis");
const function_1 = require("../../util/function");
const validation_1 = require("../../util/validation");
const secondaryAxisTicks_1 = require("../../util/secondaryAxisTicks");
function NUMBER_OR_NAN(min, max) {
    // Can be NaN or finite number
    const message = `expecting a finite Number${(min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')}`;
    return validation_1.predicateWithMessage((v) => typeof v === 'number' &&
        (isNaN(v) || Number.isFinite(v)) &&
        (min !== undefined ? v >= min : true) &&
        (max !== undefined ? v <= max : true), message);
}
class NumberAxis extends chartAxis_1.ChartAxis {
    constructor(scale = new linearScale_1.LinearScale()) {
        super(scale);
        this.min = NaN;
        this.max = NaN;
        this.scale.clamper = continuousScale_1.filter;
    }
    normaliseDataDomain(d) {
        const { min, max } = this;
        if (d.length > 2) {
            d = array_1.extent(d, value_1.isContinuous, Number) || [NaN, NaN];
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
        this.scale.clamp = true;
        return d;
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
    updateSecondaryAxisTicks(primaryTickCount) {
        if (this.dataDomain == null) {
            throw new Error('AG Charts - dataDomain not calculated, cannot perform tick calculation.');
        }
        const [d, ticks] = secondaryAxisTicks_1.calculateNiceSecondaryAxis(this.dataDomain, (primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : 0));
        this.scale.domain = d;
        return ticks;
    }
}
NumberAxis.className = 'NumberAxis';
NumberAxis.type = 'number';
__decorate([
    validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.LESS_THAN('max')))
], NumberAxis.prototype, "min", void 0);
__decorate([
    validation_1.Validate(validation_1.AND(NUMBER_OR_NAN(), validation_1.GREATER_THAN('min')))
], NumberAxis.prototype, "max", void 0);
exports.NumberAxis = NumberAxis;
