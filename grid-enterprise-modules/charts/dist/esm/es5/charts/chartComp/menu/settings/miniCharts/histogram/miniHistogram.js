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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { MiniChartWithAxes } from "../miniChartWithAxes";
import { _Scene } from "ag-charts-community";
var MiniHistogram = /** @class */ (function (_super) {
    __extends(MiniHistogram, _super);
    function MiniHistogram(container, fills, strokes) {
        var _this = _super.call(this, container, "histogramTooltip") || this;
        var padding = _this.padding;
        var size = _this.size;
        // approx normal curve
        var data = [2, 5, 11, 13, 10, 6, 1];
        var xScale = new _Scene.LinearScale();
        xScale.domain = [0, data.length];
        xScale.range = [padding, size - padding];
        var yScale = new _Scene.LinearScale();
        yScale.domain = [0, data.reduce(function (a, b) { return Math.max(a, b); }, 0)];
        yScale.range = [size - padding, padding];
        var bottom = yScale.convert(0);
        _this.bars = data.map(function (datum, i) {
            var top = yScale.convert(datum);
            var left = xScale.convert(i);
            var right = xScale.convert(i + 1);
            var rect = new _Scene.Rect();
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
        var _c = __read(_a, 1), fill = _c[0];
        var _d = __read(_b, 1), stroke = _d[0];
        this.bars.forEach(function (bar) {
            bar.fill = fill;
            bar.stroke = stroke;
        });
    };
    MiniHistogram.chartType = 'histogram';
    return MiniHistogram;
}(MiniChartWithAxes));
export { MiniHistogram };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUhpc3RvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0cy9oaXN0b2dyYW0vbWluaUhpc3RvZ3JhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDekQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRzdDO0lBQW1DLGlDQUFpQjtJQUtoRCx1QkFBWSxTQUFzQixFQUFFLEtBQWUsRUFBRSxPQUFpQjtRQUF0RSxZQUNJLGtCQUFNLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxTQW9DdkM7UUFsQ0csSUFBTSxPQUFPLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQztRQUM3QixJQUFNLElBQUksR0FBRyxLQUFJLENBQUMsSUFBSSxDQUFDO1FBRXZCLHNCQUFzQjtRQUN0QixJQUFNLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXRDLElBQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLElBQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBZCxDQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RCxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxHQUFHLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV6QyxJQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpDLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBRSxDQUFDO1lBQzFCLElBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVwQyxJQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNkLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUVsQixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztRQUVILEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLEtBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7SUFDaEMsQ0FBQztJQUVELG9DQUFZLEdBQVosVUFBYSxFQUFnQixFQUFFLEVBQWtCO1lBQXBDLEtBQUEsYUFBZ0IsRUFBZixJQUFJLFFBQUE7WUFBYSxLQUFBLGFBQWtCLEVBQWpCLE1BQU0sUUFBQTtRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7WUFDakIsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBaERNLHVCQUFTLEdBQWMsV0FBVyxDQUFDO0lBaUQ5QyxvQkFBQztDQUFBLEFBbERELENBQW1DLGlCQUFpQixHQWtEbkQ7U0FsRFksYUFBYSJ9