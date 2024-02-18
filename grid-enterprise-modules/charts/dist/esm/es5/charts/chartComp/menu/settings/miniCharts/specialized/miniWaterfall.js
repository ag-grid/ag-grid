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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { _Scene, _Theme } from 'ag-charts-community';
import { accumulateData } from '../miniChartHelpers';
import { MiniChartWithAxes } from '../miniChartWithAxes';
var MiniWaterfall = /** @class */ (function (_super) {
    __extends(MiniWaterfall, _super);
    function MiniWaterfall(container, fills, strokes, themeTemplate, isCustomTheme) {
        var _this = _super.call(this, container, 'waterfallTooltip') || this;
        _this.data = [4, 3, -3, 6, -3];
        _this.bars = _this.createWaterfall(_this.root, _this.data, _this.size, _this.padding, 'vertical').bars;
        _this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
        return _this;
    }
    MiniWaterfall.prototype.updateColors = function (fills, strokes, themeTemplate, isCustomTheme) {
        var _a, _b;
        var data = this.data;
        var properties = (themeTemplate !== null && themeTemplate !== void 0 ? themeTemplate : {}).properties;
        var palettePositive = {
            fill: fills[0],
            stroke: strokes[0],
        };
        var paletteNegative = {
            fill: fills[1],
            stroke: strokes[1],
        };
        var positive = isCustomTheme ? palettePositive : (_a = properties === null || properties === void 0 ? void 0 : properties.get(_Theme.DEFAULT_WATERFALL_SERIES_POSITIVE_COLOURS)) !== null && _a !== void 0 ? _a : palettePositive;
        var negative = isCustomTheme ? paletteNegative : (_b = properties === null || properties === void 0 ? void 0 : properties.get(_Theme.DEFAULT_WATERFALL_SERIES_NEGATIVE_COLOURS)) !== null && _b !== void 0 ? _b : paletteNegative;
        this.bars.forEach(function (bar, i) {
            var isPositive = data[i] >= 0;
            bar.fill = isPositive ? positive.fill : negative.fill;
            bar.stroke = isPositive ? positive.stroke : negative.stroke;
        });
    };
    MiniWaterfall.prototype.createWaterfall = function (root, data, size, padding, direction) {
        var scalePadding = 2 * padding;
        var _a = accumulateData(data.map(function (d) { return [d]; })), processedData = _a.processedData, min = _a.min, max = _a.max;
        var flatData = processedData.reduce(function (flat, d) { return flat.concat(d); }, []);
        var yScale = new _Scene.LinearScale();
        yScale.domain = [Math.min(min, 0), max];
        yScale.range = [size - scalePadding, scalePadding];
        var xScale = new _Scene.BandScale();
        xScale.domain = data.map(function (_, index) { return index; });
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.2;
        xScale.paddingOuter = 0.3;
        var width = xScale.bandwidth;
        var connectorLine = new _Scene.Path();
        connectorLine.stroke = '#575757';
        connectorLine.strokeWidth = 0;
        var pixelAlignmentOffset = (Math.floor(connectorLine.strokeWidth) % 2) / 2;
        var connectorPath = connectorLine.path;
        connectorPath.clear();
        var barAlongX = direction === 'horizontal';
        var bars = flatData.map(function (datum, i) {
            var previousDatum = i > 0 ? flatData[i - 1] : 0;
            var rawValue = data[i];
            var isPositive = rawValue > 0;
            var currY = Math.round(yScale.convert(datum));
            var trailY = Math.round(yScale.convert(previousDatum));
            var y = (isPositive ? currY : trailY) - pixelAlignmentOffset;
            var bottomY = (isPositive ? trailY : currY) + pixelAlignmentOffset;
            var height = Math.abs(bottomY - y);
            var x = xScale.convert(i);
            var rect = new _Scene.Rect();
            rect.x = barAlongX ? y : x;
            rect.y = barAlongX ? x : y;
            rect.width = barAlongX ? height : width;
            rect.height = barAlongX ? width : height;
            rect.strokeWidth = 0;
            rect.crisp = true;
            var moveTo = currY + pixelAlignmentOffset;
            var lineTo = trailY + pixelAlignmentOffset;
            if (i > 0) {
                var lineToX = barAlongX ? lineTo : rect.x;
                var lineToY = barAlongX ? rect.y : lineTo;
                connectorPath.lineTo(lineToX, lineToY);
            }
            var moveToX = barAlongX ? moveTo : rect.x;
            var moveToY = barAlongX ? rect.y : moveTo;
            connectorPath.moveTo(moveToX, moveToY);
            return rect;
        });
        root.append(__spreadArray([connectorLine], __read(bars), false));
        return { bars: bars };
    };
    MiniWaterfall.chartType = 'waterfall';
    return MiniWaterfall;
}(MiniChartWithAxes));
export { MiniWaterfall };
