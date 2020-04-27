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
import { ChartType } from "@ag-grid-community/core";
import { MiniChartWithAxes } from "./miniChartWithAxes";
import { linearScale, BandScale, Rect } from "ag-charts-community";
var MiniStackedColumn = /** @class */ (function (_super) {
    __extends(MiniStackedColumn, _super);
    function MiniStackedColumn(container, fills, strokes, data, yScaleDomain, tooltipName) {
        if (data === void 0) { data = MiniStackedColumn.data; }
        if (yScaleDomain === void 0) { yScaleDomain = [0, 16]; }
        if (tooltipName === void 0) { tooltipName = "stackedColumnTooltip"; }
        var _this = _super.call(this, container, tooltipName) || this;
        var padding = _this.padding;
        var size = _this.size;
        var xScale = new BandScale();
        xScale.domain = [0, 1, 2];
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.3;
        xScale.paddingOuter = 0.3;
        var yScale = linearScale();
        yScale.domain = yScaleDomain;
        yScale.range = [size - padding, padding];
        var bottom = yScale.convert(0);
        var width = xScale.bandwidth;
        _this.bars = data.map(function (series) {
            return series.map(function (datum, i) {
                var top = yScale.convert(datum);
                var rect = new Rect();
                rect.x = xScale.convert(i);
                rect.y = top;
                rect.width = width;
                rect.height = bottom - top;
                rect.strokeWidth = 1;
                rect.crisp = true;
                return rect;
            });
        });
        _this.updateColors(fills, strokes);
        _this.root.append([].concat.apply([], _this.bars));
        return _this;
    }
    MiniStackedColumn.prototype.updateColors = function (fills, strokes) {
        this.bars.forEach(function (series, i) {
            return series.forEach(function (bar) {
                bar.fill = fills[i];
                bar.stroke = strokes[i];
            });
        });
    };
    MiniStackedColumn.chartType = ChartType.StackedColumn;
    MiniStackedColumn.data = [
        [8, 12, 16],
        [6, 9, 12],
        [2, 3, 4]
    ];
    return MiniStackedColumn;
}(MiniChartWithAxes));
export { MiniStackedColumn };
