"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniRangeArea = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var miniChartWithAxes_1 = require("../miniChartWithAxes");
var MiniRangeArea = /** @class */ (function (_super) {
    __extends(MiniRangeArea, _super);
    function MiniRangeArea(container, fills, strokes) {
        var _this = _super.call(this, container, 'rangeAreaTooltip') || this;
        // Create a set of repeating zigzag-shaped data series to use as the chart data
        var period = 4;
        var dataSeriesMidpoints = [
            zigzag({ offset: 0.375 * period, length: period, pattern: { low: 3, high: 5, period: period } }),
            zigzag({ offset: 0.375 * period, length: period, pattern: { low: 2.25, high: 4.25, period: period } }),
            zigzag({ offset: 0.75 * period, length: period, pattern: { low: 2.5, high: 4.5, period: period } }),
        ];
        var dataSeriesWidth = 1.75;
        var data = dataSeriesMidpoints.map(function (series) {
            return series.map(function (_a) {
                var _b = __read(_a, 2), x = _b[0], y = _b[1];
                return ({
                    x: x,
                    low: y - 0.5 * dataSeriesWidth,
                    high: y + 0.5 * dataSeriesWidth,
                });
            });
        });
        var _a = _this.createRangeArea(_this.root, data, _this.size, _this.padding), lines = _a.lines, areas = _a.areas;
        _this.lines = lines;
        _this.areas = areas;
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniRangeArea.prototype.updateColors = function (fills, strokes) {
        // Swap the secondary and tertiary colors to match the designs
        fills = swapArrayItems(fills, 1, 2);
        strokes = swapArrayItems(strokes, 1, 2);
        this.lines.forEach(function (_a, i) {
            var _b = __read(_a, 2), highLine = _b[0], lowLine = _b[1];
            highLine.fill = undefined;
            highLine.stroke = strokes[i];
            lowLine.fill = undefined;
            lowLine.stroke = strokes[i];
        });
        this.areas.forEach(function (area, i) {
            area.fill = fills[i];
        });
    };
    MiniRangeArea.prototype.createRangeArea = function (root, data, size, padding) {
        var xMin = data.reduce(function (acc, series) { return series.reduce(function (acc, _a) {
            var x = _a.x;
            return Math.min(acc, x);
        }, acc); }, Infinity);
        var xMax = data.reduce(function (acc, series) { return series.reduce(function (acc, _a) {
            var x = _a.x;
            return Math.max(acc, x);
        }, acc); }, -Infinity);
        var yMin = data.reduce(function (acc, series) { return series.reduce(function (acc, _a) {
            var low = _a.low;
            return Math.min(acc, low);
        }, acc); }, Infinity);
        var yMax = data.reduce(function (acc, series) { return series.reduce(function (acc, _a) {
            var high = _a.high;
            return Math.max(acc, high);
        }, acc); }, -Infinity);
        var xScale = new ag_charts_community_1._Scene.LinearScale();
        xScale.domain = [xMin, xMax];
        xScale.range = [padding, size - padding];
        var scalePadding = 2 * padding;
        var yScale = new ag_charts_community_1._Scene.LinearScale();
        yScale.domain = [yMin, yMax];
        yScale.range = [size - scalePadding, scalePadding];
        var lines = [];
        var areas = [];
        var lowPoints = data.map(function (series) {
            var highLine = new ag_charts_community_1._Scene.Path();
            var lowLine = new ag_charts_community_1._Scene.Path();
            var area = new ag_charts_community_1._Scene.Path();
            lines.push([highLine, lowLine]);
            areas.push(area);
            highLine.strokeWidth = 0;
            lowLine.strokeWidth = 0;
            area.strokeWidth = 0;
            area.fillOpacity = 0.8;
            highLine.path.clear();
            lowLine.path.clear();
            area.path.clear();
            return series.map(function (datum, datumIndex) {
                var x = datum.x, low = datum.low, high = datum.high;
                var scaledX = xScale.convert(x);
                var yLow = yScale.convert(low);
                var yHigh = yScale.convert(high);
                var command = datumIndex > 0 ? 'lineTo' : 'moveTo';
                highLine.path[command](scaledX, yHigh);
                lowLine.path[command](scaledX, yLow);
                area.path[command](scaledX, yHigh);
                return [scaledX, yLow];
            });
        });
        lowPoints.forEach(function (seriesLowPoints, seriesIndex) {
            var n = seriesLowPoints.length - 1;
            var area = areas[seriesIndex];
            for (var datumIndex = n; datumIndex >= 0; datumIndex--) {
                var _a = __read(seriesLowPoints[datumIndex], 2), x = _a[0], y = _a[1];
                area.path['lineTo'](x, y);
            }
        });
        root.append(areas.concat.apply(areas, __spreadArray([], __read(lines), false)));
        return { lines: lines, areas: areas };
    };
    MiniRangeArea.chartType = 'rangeArea';
    return MiniRangeArea;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniRangeArea = MiniRangeArea;
function zigzag(options) {
    var offset = options.offset, length = options.length, pattern = options.pattern;
    // Generate [x, y] points for all inflection points of the zigzag pattern that fall within the range
    var points = getZigzagInflectionPoints(offset, length, pattern);
    // Ensure the first and last points are clamped to the start and end of the range
    var xMin = 0;
    var xMax = length;
    if (points.length === 0 || points[0][0] !== xMin)
        points.unshift(getZigzagPoint(xMin, offset, pattern));
    if (points[points.length - 1][0] !== xMax)
        points.push(getZigzagPoint(xMax, offset, pattern));
    return points;
    function getZigzagInflectionPoints(offset, length, pattern) {
        var period = pattern.period;
        var scaledOffset = offset / period;
        var patternInflectionPoints = [0, 0.5];
        var inflectionPoints = patternInflectionPoints
            .map(function (x) { return x - scaledOffset; })
            .map(getRemainderAbs)
            .sort();
        var repeatedPoints = Array.from({ length: Math.floor(inflectionPoints.length * (period / length)) }, function (_, i) { return inflectionPoints[i % inflectionPoints.length] + Math.floor(i / inflectionPoints.length); });
        return repeatedPoints.map(function (x) { return x * period; }).map(function (x) { return getZigzagPoint(x, offset, pattern); });
    }
    function getZigzagPoint(x, offset, pattern) {
        return [x, getZigzagValue(offset + x, pattern)];
    }
    function getZigzagValue(x, pattern) {
        var low = pattern.low, high = pattern.high, period = pattern.period;
        var scaledX = getRemainderAbs(x / period);
        var y = scaledX > 0.5 ? 1 - 2 * (scaledX - 0.5) : 2 * scaledX;
        return low + (high - low) * y;
    }
}
function getRemainderAbs(value) {
    var remainder = value % 1;
    return remainder < 0 ? remainder + 1 : remainder;
}
function swapArrayItems(items, leftIndex, rightIndex) {
    var results = __spreadArray([], __read(items), false);
    var temp = results[leftIndex];
    results[leftIndex] = results[rightIndex];
    results[rightIndex] = temp;
    return results;
}
