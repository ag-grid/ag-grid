"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarAxis = void 0;
const axis_1 = require("../../axis");
class PolarAxis extends axis_1.Axis {
    constructor() {
        super(...arguments);
        this.shape = 'polygon';
    }
    computeLabelsBBox(_options, _seriesRect) {
        return null;
    }
}
exports.PolarAxis = PolarAxis;
