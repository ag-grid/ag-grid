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
var MiniColumn = /** @class */ (function (_super) {
    __extends(MiniColumn, _super);
    function MiniColumn(container, fills, strokes) {
        var _this = _super.call(this, container, "groupedColumnTooltip") || this;
        var padding = _this.padding;
        var size = _this.size;
        var data = [2, 3, 4];
        var xScale = new ag_charts_community_1.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;
        var yScale = ag_charts_community_1.linearScale();
        yScale.domain = [0, 4];
        yScale.range = [size - padding, padding];
        var bottom = yScale.convert(0);
        var width = xScale.bandwidth;
        _this.bars = data.map(function (datum, i) {
            var top = yScale.convert(datum);
            var rect = new ag_charts_community_1.Rect();
            rect.x = xScale.convert(i);
            rect.y = top;
            rect.width = width;
            rect.height = bottom - top;
            rect.strokeWidth = 1;
            rect.crisp = true;
            return rect;
        });
        _this.updateColors(fills, strokes);
        _this.root.append(_this.bars);
        return _this;
    }
    MiniColumn.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
    };
    MiniColumn.chartType = core_1.ChartType.GroupedColumn;
    return MiniColumn;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniColumn = MiniColumn;
//# sourceMappingURL=miniColumn.js.map