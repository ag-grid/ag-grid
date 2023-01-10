"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniScatter = void 0;
var miniChartWithAxes_1 = require("../miniChartWithAxes");
var ag_charts_community_1 = require("ag-charts-community");
var MiniScatter = /** @class */ (function (_super) {
    __extends(MiniScatter, _super);
    function MiniScatter(container, fills, strokes) {
        var _this = _super.call(this, container, "scatterTooltip") || this;
        var size = _this.size;
        var padding = _this.padding;
        // [x, y] pairs
        var data = [
            [[0.3, 3], [1.1, 0.9], [2, 0.4], [3.4, 2.4]],
            [[0, 0.3], [1, 2], [2.4, 1.4], [3, 0]]
        ];
        var xScale = new ag_charts_community_1._Scene.LinearScale();
        xScale.domain = [-0.5, 4];
        xScale.range = [padding * 2, size - padding];
        var yScale = new ag_charts_community_1._Scene.LinearScale();
        yScale.domain = [-0.5, 3.5];
        yScale.range = [size - padding, padding];
        var points = [];
        data.forEach(function (series) {
            series.forEach(function (_a) {
                var _b = __read(_a, 2), x = _b[0], y = _b[1];
                var arc = new ag_charts_community_1._Scene.Arc();
                arc.strokeWidth = 1;
                arc.centerX = xScale.convert(x);
                arc.centerY = yScale.convert(y);
                arc.radiusX = arc.radiusY = 2.5;
                points.push(arc);
            });
        });
        _this.points = points;
        _this.updateColors(fills, strokes);
        var clipRect = new ag_charts_community_1._Scene.ClipRect();
        clipRect.x = clipRect.y = padding;
        clipRect.width = clipRect.height = size - padding * 2;
        clipRect.append(_this.points);
        _this.root.append(clipRect);
        return _this;
    }
    MiniScatter.prototype.updateColors = function (fills, strokes) {
        this.points.forEach(function (line, i) {
            line.stroke = strokes[i % strokes.length];
            line.fill = fills[i % fills.length];
        });
    };
    MiniScatter.chartType = 'scatter';
    return MiniScatter;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniScatter = MiniScatter;
