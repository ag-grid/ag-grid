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
var MiniStackedArea = /** @class */ (function (_super) {
    __extends(MiniStackedArea, _super);
    function MiniStackedArea(container, fills, strokes, data, tooltipName) {
        if (data === void 0) { data = MiniStackedArea.data; }
        if (tooltipName === void 0) { tooltipName = "stackedAreaTooltip"; }
        var _this = _super.call(this, container, tooltipName) || this;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = new BandScale();
        xScale.domain = [0, 1, 2];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.range = [padding + 0.5, size - padding - 0.5];
        var yScale = linearScale();
        yScale.domain = [0, 16];
        yScale.range = [size - padding + 0.5, padding + 0.5];
        var xCount = data.length;
        var last = xCount * 2 - 1;
        var pathData = [];
        data.forEach(function (datum, i) {
            var x = xScale.convert(i);
            var total = 0;
            datum.forEach(function (yDatum, j) {
                var y = yScale.convert(total + yDatum);
                var points = pathData[j] || (pathData[j] = []);
                points[i] = {
                    x: x,
                    y: y
                };
                points[last - i] = {
                    x: x,
                    y: yScale.convert(total) // bottom y
                };
                total += yDatum;
            });
        });
        _this.areas = pathData.map(function (points) {
            var area = new Path();
            area.strokeWidth = 1;
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
    MiniStackedArea.prototype.updateColors = function (fills, strokes) {
        this.areas.forEach(function (area, i) {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
    };
    MiniStackedArea.chartType = ChartType.StackedArea;
    MiniStackedArea.data = [
        [2, 3, 2],
        [3, 6, 5],
        [6, 2, 2]
    ];
    return MiniStackedArea;
}(MiniChartWithAxes));
export { MiniStackedArea };
