"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchySeries = void 0;
const series_1 = require("../series");
class HierarchySeries extends series_1.Series {
    constructor() {
        super({ pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH] });
    }
    getLabelData() {
        return [];
    }
}
exports.HierarchySeries = HierarchySeries;
