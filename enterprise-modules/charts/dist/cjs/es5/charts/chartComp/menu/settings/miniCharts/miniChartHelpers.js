"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_charts_community_1 = require("ag-charts-community");
function createColumnRects(params) {
    var stacked = params.stacked, size = params.size, padding = params.padding, xScalePadding = params.xScalePadding, xScaleDomain = params.xScaleDomain, yScaleDomain = params.yScaleDomain;
    var xScale = new ag_charts_community_1.BandScale();
    xScale.domain = xScaleDomain;
    xScale.range = [padding, size - padding];
    xScale.paddingInner = xScalePadding;
    xScale.paddingOuter = xScalePadding;
    var yScale = new ag_charts_community_1.LinearScale();
    yScale.domain = yScaleDomain;
    yScale.range = [size - padding, padding];
    var createBars = function (series, xScale, yScale) {
        return series.map(function (datum, i) {
            var top = yScale.convert(datum);
            var rect = new ag_charts_community_1.Rect();
            rect.x = xScale.convert(i);
            rect.y = top;
            rect.width = xScale.bandwidth;
            rect.height = yScale.convert(0) - top;
            rect.strokeWidth = 1;
            rect.crisp = true;
            return rect;
        });
    };
    if (stacked) {
        return params.data.map(function (d) { return createBars(d, xScale, yScale); });
    }
    return createBars(params.data, xScale, yScale);
}
exports.createColumnRects = createColumnRects;
function createLinePaths(root, data, size, padding) {
    var xScale = new ag_charts_community_1.LinearScale();
    xScale.domain = [0, 4];
    xScale.range = [padding, size - padding];
    var yScale = new ag_charts_community_1.LinearScale();
    yScale.domain = [0, 10];
    yScale.range = [size - padding, padding];
    var lines = data.map(function (series) {
        var line = new ag_charts_community_1.Path();
        line.strokeWidth = 3;
        line.lineCap = "round";
        line.fill = undefined;
        series.forEach(function (datum, i) {
            line.path[i > 0 ? "lineTo" : "moveTo"](xScale.convert(i), yScale.convert(datum));
        });
        return line;
    });
    var clipRect = new ag_charts_community_1.ClipRect();
    clipRect.x = clipRect.y = padding;
    clipRect.width = clipRect.height = size - padding * 2;
    clipRect.append(lines);
    root.append(clipRect);
    return lines;
}
exports.createLinePaths = createLinePaths;
