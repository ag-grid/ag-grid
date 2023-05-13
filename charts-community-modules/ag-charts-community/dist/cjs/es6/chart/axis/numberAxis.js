"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberAxis = void 0;
const linearScale_1 = require("../../scale/linearScale");
const array_1 = require("../../util/array");
const chartAxis_1 = require("../chartAxis");
const validation_1 = require("../../util/validation");
const default_1 = require("../../util/default");
const secondaryAxisTicks_1 = require("../../util/secondaryAxisTicks");
const logger_1 = require("../../util/logger");
class NumberAxis extends chartAxis_1.ChartAxis {
    constructor(moduleCtx, scale = new linearScale_1.LinearScale()) {
        super(moduleCtx, scale);
        this.min = NaN;
        this.max = NaN;
        scale.strictClampByDefault = true;
    }
    normaliseDataDomain(d) {
        const { min, max } = this;
        if (d.length > 2) {
            d = array_1.extent(d) || [NaN, NaN];
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
    formatDatum(datum) {
        if (typeof datum === 'number') {
            return datum.toFixed(2);
        }
        else {
            logger_1.Logger.warnOnce('data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.');
            return String(datum);
        }
    }
    updateSecondaryAxisTicks(primaryTickCount) {
        if (this.dataDomain == null) {
            throw new Error('AG Charts - dataDomain not calculated, cannot perform tick calculation.');
        }
        const [d, ticks] = secondaryAxisTicks_1.calculateNiceSecondaryAxis(this.dataDomain, primaryTickCount !== null && primaryTickCount !== void 0 ? primaryTickCount : 0);
        this.scale.nice = false;
        this.scale.domain = d;
        this.scale.update();
        return ticks;
    }
}
NumberAxis.className = 'NumberAxis';
NumberAxis.type = 'number';
__decorate([
    validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(), validation_1.LESS_THAN('max'))),
    default_1.Default(NaN)
], NumberAxis.prototype, "min", void 0);
__decorate([
    validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(), validation_1.GREATER_THAN('min'))),
    default_1.Default(NaN)
], NumberAxis.prototype, "max", void 0);
exports.NumberAxis = NumberAxis;
