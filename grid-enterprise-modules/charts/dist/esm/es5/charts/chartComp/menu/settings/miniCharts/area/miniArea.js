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
var MiniArea = /** @class */ (function (_super) {
    __extends(MiniArea, _super);
    function MiniArea(container, fills, strokes, data) {
        if (data === void 0) { data = MiniArea.data; }
        var _this = _super.call(this, container, "groupedAreaTooltip") || this;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = new _Scene.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.range = [padding + 0.5, size - padding - 0.5];
        var yScale = new _Scene.LinearScale();
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
            var area = new _Scene.Path();
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
    MiniArea.chartType = 'area';
    MiniArea.data = [
        [1, 3, 5],
        [2, 6, 4],
        [5, 3, 1]
    ];
    return MiniArea;
}(MiniChartWithAxes));
export { MiniArea };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L3NldHRpbmdzL21pbmlDaGFydHMvYXJlYS9taW5pQXJlYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFRN0M7SUFBOEIsNEJBQWlCO0lBVzNDLGtCQUFZLFNBQXNCLEVBQUUsS0FBZSxFQUFFLE9BQWlCLEVBQUUsSUFBZ0M7UUFBaEMscUJBQUEsRUFBQSxPQUFtQixRQUFRLENBQUMsSUFBSTtRQUF4RyxZQUNJLGtCQUFNLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxTQXNEekM7UUFwREcsSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDO1FBRTdCLElBQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBVSxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLElBQUksR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFFckQsSUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2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