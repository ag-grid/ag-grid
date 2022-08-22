"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function circleRectOverlap(cx, cy, r, x, y, w, h) {
    // Find closest horizontal and vertical edges.
    var edgeX = cx < x ? x : cx > x + w ? x + w : cx;
    var edgeY = cy < y ? y : cy > y + h ? y + h : cy;
    // Find distance to closest edges.
    var dx = cx - edgeX;
    var dy = cy - edgeY;
    var d = Math.sqrt(dx * dx + dy * dy);
    return d <= r;
}
function rectRectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    var xOverlap = x1 + w1 > x2 && x1 < x2 + w2;
    var yOverlap = y1 + h1 > y2 && y1 < y2 + h2;
    return xOverlap && yOverlap;
}
function rectContainsRect(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
    return r2x + r2w < r1x + r1w && r2x > r1x && r2y > r1y && r2y + r2h < r1y + r1h;
}
function isPointLabelDatum(x) {
    return x != null && typeof x.point === 'object' && typeof x.label === 'object';
}
exports.isPointLabelDatum = isPointLabelDatum;
/**
 * @param data Points and labels for one or more series. The order of series determines label placement precedence.
 * @param bounds Bounds to fit the labels into. If a label can't be fully contained, it doesn't fit.
 * @returns Placed labels for the given series (in the given order).
 */
function placeLabels(data, bounds, padding) {
    if (padding === void 0) { padding = 5; }
    var result = [];
    data = data.map(function (d) { return d.slice().sort(function (a, b) { return b.point.size - a.point.size; }); });
    for (var j = 0; j < data.length; j++) {
        var labels = (result[j] = []);
        var datum = data[j];
        if (!(datum && datum.length && datum[0].label)) {
            continue;
        }
        var _loop_1 = function (i, ln) {
            var d = datum[i];
            var l = d.label;
            var r = d.point.size * 0.5;
            var x = d.point.x - l.width * 0.5;
            var y = d.point.y - r - l.height - padding;
            var width = l.width, height = l.height;
            var withinBounds = !bounds || rectContainsRect(bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
            if (!withinBounds) {
                return "continue";
            }
            var overlapPoints = data.some(function (datum) {
                return datum.some(function (d) { return circleRectOverlap(d.point.x, d.point.y, d.point.size * 0.5, x, y, width, height); });
            });
            if (overlapPoints) {
                return "continue";
            }
            var overlapLabels = result.some(function (labels) {
                return labels.some(function (l) { return rectRectOverlap(l.x, l.y, l.width, l.height, x, y, width, height); });
            });
            if (overlapLabels) {
                return "continue";
            }
            labels.push({
                index: i,
                text: l.text,
                x: x,
                y: y,
                width: width,
                height: height,
                datum: d,
            });
        };
        for (var i = 0, ln = datum.length; i < ln; i++) {
            _loop_1(i, ln);
        }
    }
    return result;
}
exports.placeLabels = placeLabels;
