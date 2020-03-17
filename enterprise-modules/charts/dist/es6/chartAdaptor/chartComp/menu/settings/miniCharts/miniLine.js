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
import { linearScale, ClipRect, Path } from "ag-charts-community";
var MiniLine = /** @class */ (function (_super) {
    __extends(MiniLine, _super);
    function MiniLine(container, fills, strokes) {
        var _this = _super.call(this, container, "lineTooltip") || this;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = linearScale();
        xScale.domain = [0, 4];
        xScale.range = [padding, size - padding];
        var yScale = linearScale();
        yScale.domain = [0, 10];
        yScale.range = [size - padding, padding];
        var data = [
            [9, 7, 8, 5, 6],
            [5, 6, 3, 4, 1],
            [1, 3, 4, 8, 7]
        ];
        _this.lines = data.map(function (series) {
            var line = new Path();
            line.strokeWidth = 3;
            line.lineCap = "round";
            line.fill = undefined;
            series.forEach(function (datum, i) {
                line.path[i > 0 ? "lineTo" : "moveTo"](xScale.convert(i), yScale.convert(datum));
            });
            return line;
        });
        _this.updateColors(fills, strokes);
        var clipRect = new ClipRect();
        clipRect.x = clipRect.y = padding;
        clipRect.width = clipRect.height = size - padding * 2;
        clipRect.append(_this.lines);
        _this.root.append(clipRect);
        return _this;
    }
    MiniLine.prototype.updateColors = function (fills, strokes) {
        this.lines.forEach(function (line, i) {
            line.stroke = fills[i];
        });
    };
    MiniLine.chartType = ChartType.Line;
    return MiniLine;
}(MiniChartWithAxes));
export { MiniLine };
