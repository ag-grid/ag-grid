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
import { linearScale, BandScale, Path } from "ag-charts-community";
var MiniArea = /** @class */ (function (_super) {
    __extends(MiniArea, _super);
    function MiniArea(container, fills, strokes, data) {
        if (data === void 0) { data = MiniArea.data; }
        var _this = _super.call(this, container, "groupedAreaTooltip") || this;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = new BandScale();
        xScale.domain = [0, 1, 2];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.range = [padding + 0.5, size - padding - 0.5];
        var yScale = linearScale();
        yScale.domain = [0, 6];
        yScale.range = [size - padding + 0.5, padding];
        var xCount = data.length;
        var last = xCount * 2 - 1;
        var pathData = [];
        var bottomY = yScale.convert(0);
        data.forEach(function (datum, i) {
            var x = xScale.convert(i);
            datum.forEach(function (yDatum, j) {
                var y = yScale.convert(yDatum);
                var points = pathData[j] || (pathData[j] = []);
                points[i] = {
                    x: x,
                    y: y
                };
                points[last - i] = {
                    x: x,
                    y: bottomY
                };
            });
        });
        _this.areas = pathData.reverse().map(function (points) {
            var area = new Path();
            area.strokeWidth = 1;
            area.fillOpacity = 0.7;
            var path = area.path;
            path.clear();
            points.forEach(function (point, i) { return path[i > 0 ? "lineTo" : "moveTo"](point.x, point.y); });
            path.closePath();
            return area;
        });
        _this.updateColors(fills, strokes);
        _this.root.append(_this.areas);
        return _this;
    }
    MiniArea.prototype.updateColors = function (fills, strokes) {
        this.areas.forEach(function (area, i) {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    };
    MiniArea.chartType = ChartType.Area;
    MiniArea.data = [
        [1, 3, 5],
        [2, 6, 4],
        [5, 3, 1]
    ];
    return MiniArea;
}(MiniChartWithAxes));
export { MiniArea };
