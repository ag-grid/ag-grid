"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var miniChartWithAxes_1 = require("./miniChartWithAxes");
var ag_charts_community_1 = require("ag-charts-community");
var MiniHistogram = /** @class */ (function (_super) {
    __extends(MiniHistogram, _super);
    function MiniHistogram(container, fills, strokes) {
        var _this = _super.call(this, container, "histogramTooltip") || this;
        var padding = _this.padding;
        var size = _this.size;
        // approx normal curve
        var data = [2, 5, 11, 13, 10, 6, 1];
        var xScale = ag_charts_community_1.linearScale();
        xScale.domain = [0, data.length];
        xScale.range = [padding, size - padding];
        var yScale = ag_charts_community_1.linearScale();
        yScale.domain = [0, data.reduce(function (a, b) { return Math.max(a, b); }, 0)];
        yScale.range = [size - padding, padding];
        var bottom = yScale.convert(0);
        _this.bars = data.map(function (datum, i) {
            var top = yScale.convert(datum);
            var left = xScale.convert(i);
            var right = xScale.convert(i + 1);
            var rect = new ag_charts_community_1.Rect();
            rect.x = left;
            rect.y = top;
            rect.width = right - left;
            rect.height = bottom - top;
            rect.strokeWidth = 1;
            rect.crisp = true;
            return rect;
        });
        _this.updateColors(fills, strokes);
        _this.root.append(_this.bars);
        return _this;
    }
    MiniHistogram.prototype.updateColors = function (_a, _b) {
        var fill = _a[0];
        var stroke = _b[0];
        this.bars.forEach(function (bar) {
            bar.fill = fill;
            bar.stroke = stroke;
        });
    };
    MiniHistogram.chartType = core_1.ChartType.Histogram;
    return MiniHistogram;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniHistogram = MiniHistogram;
//# sourceMappingURL=miniHistogram.js.map