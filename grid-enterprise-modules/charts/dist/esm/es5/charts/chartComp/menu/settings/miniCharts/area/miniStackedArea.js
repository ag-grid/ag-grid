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
var MiniStackedArea = /** @class */ (function (_super) {
    __extends(MiniStackedArea, _super);
    function MiniStackedArea(container, fills, strokes, data, tooltipName) {
        if (data === void 0) { data = MiniStackedArea.data; }
        if (tooltipName === void 0) { tooltipName = "stackedAreaTooltip"; }
        var _this = _super.call(this, container, tooltipName) || this;
        var size = _this.size;
        var padding = _this.padding;
        var xScale = new _Scene.BandScale();
        xScale.domain = [0, 1, 2];
        xScale.paddingInner = 1;
        xScale.paddingOuter = 0;
        xScale.range = [padding + 0.5, size - padding - 0.5];
        var yScale = new _Scene.LinearScale();
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
            var area = new _Scene.Path();
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
    MiniStackedArea.chartType = 'stackedArea';
    MiniStackedArea.data = [
        [2, 3, 2],
        [3, 6, 5],
        [6, 2, 2]
    ];
    return MiniStackedArea;
}(MiniChartWithAxes));
export { MiniStackedArea };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaVN0YWNrZWRBcmVhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9zZXR0aW5ncy9taW5pQ2hhcnRzL2FyZWEvbWluaVN0YWNrZWRBcmVhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXpELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUc3QztJQUFxQyxtQ0FBaUI7SUFXbEQseUJBQVksU0FBc0IsRUFBRSxLQUFlLEVBQUUsT0FBaUIsRUFBRSxJQUF1QyxFQUFFLFdBQWtDO1FBQTNFLHFCQUFBLEVBQUEsT0FBbUIsZUFBZSxDQUFDLElBQUk7UUFBRSw0QkFBQSxFQUFBLGtDQUFrQztRQUFuSixZQUNJLGtCQUFNLFNBQVMsRUFBRSxXQUFXLENBQUMsU0F1RGhDO1FBckRHLElBQU0sSUFBSSxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBTSxPQUFPLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQztRQUU3QixJQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQVUsQ0FBQztRQUM5QyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN4QixNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN4QixNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxJQUFJLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBRXJELElBQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sQ0FB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