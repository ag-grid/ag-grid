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
import { _Scene, _Theme, _Util } from 'ag-charts-community';
import { MiniChartWithAxes } from '../miniChartWithAxes';
var MiniBoxPlot = /** @class */ (function (_super) {
    __extends(MiniBoxPlot, _super);
    function MiniBoxPlot(container, fills, strokes, themeTemplateParameters, isCustomTheme) {
        var _this = _super.call(this, container, 'boxPlotTooltip') || this;
        var padding = _this.padding;
        var size = _this.size;
        var data = [11, 11.5, 10.5];
        var maxRatio = 1.2;
        var q3Ratio = 1.1;
        var q1Ratio = 0.9;
        var minRatio = 0.8;
        var yScale = new _Scene.LinearScale();
        yScale.domain = [
            data.reduce(function (a, b) { return Math.min(a, b); }, Infinity) * minRatio,
            data.reduce(function (a, b) { return Math.max(a, b); }, 0) * maxRatio,
        ];
        yScale.range = [size - 1.5 * padding, padding];
        var xScale = new _Scene.BandScale();
        xScale.domain = data.map(function (_, index) { return index; });
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.4;
        xScale.paddingOuter = 0.2;
        var bandwidth = Math.round(xScale.bandwidth);
        var halfBandWidth = Math.round(xScale.bandwidth / 2);
        _this.boxPlotGroups = data.map(function (datum, i) {
            var _a = __read([
                datum * minRatio,
                datum * q1Ratio,
                datum * q3Ratio,
                datum * maxRatio,
            ], 4), minValue = _a[0], q1Value = _a[1], q3Value = _a[2], maxValue = _a[3];
            var top = Math.round(yScale.convert(q3Value));
            var left = Math.round(xScale.convert(i));
            var right = Math.round(left + bandwidth);
            var bottom = Math.round(yScale.convert(q1Value));
            var min = Math.round(yScale.convert(minValue));
            var mid = Math.round(yScale.convert(datum));
            var max = Math.round(yScale.convert(maxValue));
            var whiskerX = left + halfBandWidth;
            var boxPlotGroup = new _Scene.Group();
            var box = new _Scene.Rect();
            var median = new _Scene.Line();
            var topWhisker = new _Scene.Line();
            var bottomWhisker = new _Scene.Line();
            var topCap = new _Scene.Line();
            var bottomCap = new _Scene.Line();
            box.x = left;
            box.y = top;
            box.width = bandwidth;
            box.height = bottom - top;
            box.strokeWidth = 1;
            box.strokeOpacity = 0.75;
            box.crisp = true;
            _this.setLineProperties(median, left, right, mid, mid);
            _this.setLineProperties(topWhisker, whiskerX, whiskerX, max, top);
            _this.setLineProperties(bottomWhisker, whiskerX, whiskerX, min, bottom);
            _this.setLineProperties(topCap, left, right, max, max);
            _this.setLineProperties(bottomCap, left, right, min, min);
            boxPlotGroup.append([box, median, topWhisker, bottomWhisker, topCap, bottomCap]);
            return boxPlotGroup;
        });
        _this.updateColors(fills, strokes, themeTemplateParameters, isCustomTheme);
        _this.root.append(_this.boxPlotGroups);
        return _this;
    }
    MiniBoxPlot.prototype.updateColors = function (fills, strokes, themeTemplateParameters, isCustomTheme) {
        var _a;
        var themeBackgroundColor = themeTemplateParameters === null || themeTemplateParameters === void 0 ? void 0 : themeTemplateParameters.properties.get(_Theme.DEFAULT_BACKGROUND_COLOUR);
        var backgroundFill = (_a = (Array.isArray(themeBackgroundColor) ? themeBackgroundColor[0] : themeBackgroundColor)) !== null && _a !== void 0 ? _a : 'white';
        this.boxPlotGroups.forEach(function (group, i) {
            var _a;
            (_a = group.children) === null || _a === void 0 ? void 0 : _a.forEach(function (node) {
                var fill = fills[i % fills.length];
                node.fill = isCustomTheme ? fill : _Util.Color.interpolate(fill, backgroundFill)(0.7);
                node.stroke = strokes[i % strokes.length];
            });
        });
    };
    MiniBoxPlot.prototype.setLineProperties = function (line, x1, x2, y1, y2) {
        line.x1 = x1;
        line.x2 = x2;
        line.y1 = y1;
        line.y2 = y2;
        line.strokeOpacity = 0.75;
    };
    MiniBoxPlot.chartType = 'boxPlot';
    return MiniBoxPlot;
}(MiniChartWithAxes));
export { MiniBoxPlot };
