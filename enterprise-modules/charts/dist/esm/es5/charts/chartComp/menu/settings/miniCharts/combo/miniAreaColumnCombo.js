var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
import { createColumnRects } from "../miniChartHelpers";
var MiniAreaColumnCombo = /** @class */ (function (_super) {
    __extends(MiniAreaColumnCombo, _super);
    function MiniAreaColumnCombo(container, fills, strokes) {
        var _this = _super.call(this, container, "areaColumnComboTooltip") || this;
        _this.columnData = [3, 4.5];
        _this.areaData = [
            [5, 4, 6, 5, 4],
        ];
        var _a = _this, root = _a.root, columnData = _a.columnData, areaData = _a.areaData, size = _a.size, padding = _a.padding;
        _this.columns = createColumnRects({
            stacked: false,
            root: root,
            data: columnData,
            size: size,
            padding: padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 6],
            xScalePadding: 0.5,
        });
        // scale for area series
        var xScale = new _Scene.BandScale();
        xScale.range = [padding, size - padding];
        xScale.domain = [0, 1, 2, 3, 4];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        var yScale = new _Scene.LinearScale();
        yScale.range = [size - padding, padding];
        yScale.domain = [0, 6];
        var pathData = [];
        var yZero = yScale.convert(0);
        var firstX = xScale.convert(0);
        areaData.forEach(function (series, i) {
            var points = pathData[i] || (pathData[i] = []);
            series.forEach(function (data, j) {
                var yDatum = data;
                var xDatum = j;
                var x = xScale.convert(xDatum);
                var y = yScale.convert(yDatum);
                points[j] = { x: x, y: y };
            });
            var lastX = xScale.convert(series.length - 1);
            pathData[i].push({
                x: lastX,
                y: yZero
            }, {
                x: firstX,
                y: yZero
            });
        });
        _this.areas = pathData.map(function (points) {
            var area = new _Scene.Path();
            area.strokeWidth = 1;
            area.fillOpacity = 0.8;
            var path = area.path;
            points.forEach(function (point, i) { return path[i > 0 ? 'lineTo' : 'moveTo'](point.x, point.y); });
            return area;
        });
        root.append(_this.areas);
        root.append([].concat.apply([], _this.columns));
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniAreaColumnCombo.prototype.updateColors = function (fills, strokes) {
        this.areas.forEach(function (area, i) {
            area.fill = fills[i];
            area.stroke = strokes[i];
        });
        this.columns.forEach(function (bar, i) {
            bar.fill = fills[i + 1];
            bar.stroke = strokes[i + 1];
        });
    };
    MiniAreaColumnCombo.chartType = 'areaColumnCombo';
    return MiniAreaColumnCombo;
}(MiniChartWithAxes));
export { MiniAreaColumnCombo };
