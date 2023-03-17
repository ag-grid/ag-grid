"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOverlays = void 0;
var overlay_1 = require("./overlay");
var ChartOverlays = /** @class */ (function () {
    function ChartOverlays(parent) {
        this.noData = new overlay_1.Overlay('ag-chart-no-data-overlay', parent);
    }
    return ChartOverlays;
}());
exports.ChartOverlays = ChartOverlays;
