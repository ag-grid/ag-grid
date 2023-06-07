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
var MiniBubble = /** @class */ (function (_super) {
    __extends(MiniBubble, _super);
    function MiniBubble(container, fills, strokes) {
        var _this = _super.call(this, container, "bubbleTooltip") || this;
        var size = _this.size;
        var padding = _this.padding;
        // [x, y, radius] triples
        var data = [
            [[0.1, 0.3, 5], [0.5, 0.4, 7], [0.2, 0.8, 7]], [[0.8, 0.7, 5], [0.7, 0.3, 9]]
        ];
        var xScale = new _Scene.LinearScale();
        xScale.domain = [0, 1];
        xScale.range = [padding * 2, size - padding];
        var yScale = new _Scene.LinearScale();
        yScale.domain = [0, 1];
        yScale.range = [size - padding, padding];
        var points = [];
        data.forEach(function (series) {
            series.forEach(function (_a) {
                var _b = __read(_a, 3), x = _b[0], y = _b[1], radius = _b[2];
                var arc = new _Scene.Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radius = radius;
                arc.fillOpacity = 0.7;
                points.push(arc);
            });
        });
        _this.points = points;
        _this.updateColors(fills, strokes);
        var pointsGroup = new _Scene.Group();
        pointsGroup.setClipRectInGroupCoordinateSpace(new _Scene.BBox(padding, padding, size - padding * 2, size - padding * 2));
        pointsGroup.append(_this.points);
        _this.root.append(pointsGroup);
        return _this;
    }
    MiniBubble.prototype.updateColors = function (fills, strokes) {
        this.points.forEach(function (line, i) {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    };
    MiniBubble.chartType = 'bubble';
    return MiniBubble;
}(MiniChartWithAxes));
export { MiniBubble };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUJ1YmJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0cy9zY2F0dGVyL21pbmlCdWJibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUc3QztJQUFnQyw4QkFBaUI7SUFLN0Msb0JBQVksU0FBc0IsRUFBRSxLQUFlLEVBQUUsT0FBaUI7UUFBdEUsWUFDSSxrQkFBTSxTQUFTLEVBQUUsZUFBZSxDQUFDLFNBdUNwQztRQXJDRyxJQUFNLElBQUksR0FBRyxLQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQU0sT0FBTyxHQUFHLEtBQUksQ0FBQyxPQUFPLENBQUM7UUFFN0IseUJBQXlCO1FBQ3pCLElBQU0sSUFBSSxHQUFHO1lBQ1QsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNoRixDQUFDO1FBRUYsSUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFFN0MsSUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxHQUFHLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV6QyxJQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO1FBRWxDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO1lBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQWM7b0JBQWQsS0FBQSxhQUFjLEVBQWIsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFBLEVBQUUsTUFBTSxRQUFBO2dCQUN6QixJQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDN0IsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEMsR0FBRyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDcEIsR0FBRyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxDLElBQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZDLFdBQVcsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekgsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsS0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7O0lBQ2xDLENBQUM7SUFFRCxpQ0FBWSxHQUFaLFVBQWEsS0FBZSxFQUFFLE9BQWlCO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQWxETSxvQkFBUyxHQUFjLFFBQVEsQ0FBQztJQW1EM0MsaUJBQUM7Q0FBQSxBQXJERCxDQUFnQyxpQkFBaUIsR0FxRGhEO1NBckRZLFVBQVUifQ==