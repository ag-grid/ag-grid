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
        var clipRect = new _Scene.ClipRect();
        clipRect.x = padding;
        clipRect.y = padding;
        clipRect.width = size - padding * 2;
        clipRect.height = size - padding * 2;
        clipRect.append(_this.points);
        _this.root.append(clipRect);
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
