"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logScale_1 = require("../../scale/logScale");
const numberAxis_1 = require("./numberAxis");
class LogAxis extends numberAxis_1.NumberAxis {
    constructor() {
        super();
        this.scale = new logScale_1.LogScale();
        this.scale.clamper = numberAxis_1.clamper;
    }
    set base(value) {
        this.scale.base = value;
    }
    get base() {
        return this.scale.base;
    }
}
exports.LogAxis = LogAxis;
LogAxis.className = 'LogAxis';
LogAxis.type = 'log';
