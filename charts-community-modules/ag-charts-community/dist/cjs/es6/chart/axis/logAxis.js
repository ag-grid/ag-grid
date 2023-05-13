"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogAxis = void 0;
const validation_1 = require("../../util/validation");
const default_1 = require("../../util/default");
const logScale_1 = require("../../scale/logScale");
const numberAxis_1 = require("./numberAxis");
const array_1 = require("../../util/array");
const logger_1 = require("../../util/logger");
function NON_ZERO_NUMBER() {
    // Cannot be 0
    const message = `expecting a non-zero Number`;
    return validation_1.predicateWithMessage((v) => typeof v === 'number' && v !== 0, message);
}
class LogAxis extends numberAxis_1.NumberAxis {
    constructor(moduleCtx) {
        super(moduleCtx, new logScale_1.LogScale());
        this.min = NaN;
        this.max = NaN;
        this.scale.strictClampByDefault = true;
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
        const isInverted = d[0] > d[1];
        const crossesZero = d[0] < 0 && d[1] > 0;
        const hasZeroExtent = d[0] === 0 && d[1] === 0;
        const invalidDomain = isInverted || crossesZero || hasZeroExtent;
        if (invalidDomain) {
            d = [];
            if (crossesZero) {
                logger_1.Logger.warn(`the data domain crosses zero, the chart data cannot be rendered. See log axis documentation for more information.`);
            }
            else if (hasZeroExtent) {
                logger_1.Logger.warn(`the data domain has 0 extent, no data is rendered.`);
            }
        }
        if (d[0] === 0) {
            d[0] = 1;
        }
        if (d[1] === 0) {
            d[1] = -1;
        }
        return d;
    }
    set base(value) {
        this.scale.base = value;
    }
    get base() {
        return this.scale.base;
    }
}
LogAxis.className = 'LogAxis';
LogAxis.type = 'log';
__decorate([
    validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(), validation_1.LESS_THAN('max'), NON_ZERO_NUMBER())),
    default_1.Default(NaN)
], LogAxis.prototype, "min", void 0);
__decorate([
    validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(), validation_1.GREATER_THAN('min'), NON_ZERO_NUMBER())),
    default_1.Default(NaN)
], LogAxis.prototype, "max", void 0);
exports.LogAxis = LogAxis;
