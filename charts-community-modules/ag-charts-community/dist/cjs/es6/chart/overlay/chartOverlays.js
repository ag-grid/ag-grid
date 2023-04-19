"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOverlays = void 0;
const overlay_1 = require("./overlay");
class ChartOverlays {
    constructor(parent) {
        this.noData = new overlay_1.Overlay('ag-chart-no-data-overlay', parent);
    }
}
exports.ChartOverlays = ChartOverlays;
