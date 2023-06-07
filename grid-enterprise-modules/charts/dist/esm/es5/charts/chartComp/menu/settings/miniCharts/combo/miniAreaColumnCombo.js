var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUFyZWFDb2x1bW5Db21iby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0cy9jb21iby9taW5pQXJlYUNvbHVtbkNvbWJvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQTJCLE1BQU0scUJBQXFCLENBQUM7QUFNakY7SUFBeUMsdUNBQWlCO0lBWXRELDZCQUFZLFNBQXNCLEVBQUUsS0FBZSxFQUFFLE9BQWlCO1FBQXRFLFlBQ0ksa0JBQU0sU0FBUyxFQUFFLHdCQUF3QixDQUFDLFNBb0U3QztRQTNFTyxnQkFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLGNBQVEsR0FBRztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNsQixDQUFDO1FBS1EsSUFBQSxLQUFnRCxLQUFJLEVBQWxELElBQUksVUFBQSxFQUFFLFVBQVUsZ0JBQUEsRUFBRSxRQUFRLGNBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxPQUFPLGFBQVMsQ0FBQztRQUUzRCxLQUFJLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDO1lBQzdCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsSUFBSSxNQUFBO1lBQ0osSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxNQUFBO1lBQ0osT0FBTyxTQUFBO1lBQ1AsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQixZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BC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