"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function circleRectOverlap(c, x, y, w, h) {
    // Find closest horizontal and vertical edges.
    var edgeX = c.x < x ? x : c.x > x + w ? x + w : c.x;
    var edgeY = c.y < y ? y : c.y > y + h ? y + h : c.y;
    // Find distance to closest edges.
    var dx = c.x - edgeX;
    var dy = c.y - edgeY;
    var d = Math.sqrt(dx * dx + dy * dy);
    return d <= c.size * 0.5;
}
function rectRectOverlap(r1, x2, y2, w2, h2) {
    var xOverlap = r1.x + r1.width > x2 && r1.x < x2 + w2;
    var yOverlap = r1.y + r1.height > y2 && r1.y < y2 + h2;
    return xOverlap && yOverlap;
}
function rectContainsRect(r1, r2x, r2y, r2w, r2h) {
    return r2x + r2w < r1.x + r1.width && r2x > r1.x && r2y > r1.y && r2y + r2h < r1.y + r1.height;
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
            var withinBounds = !bounds || rectContainsRect(bounds, x, y, width, height);
            if (!withinBounds) {
                return "continue";
            }
            var overlapPoints = data.some(function (datum) {
                return datum.some(function (d) { return circleRectOverlap(d.point, x, y, width, height); });
            });
            if (overlapPoints) {
                return "continue";
            }
            var overlapLabels = result.some(function (labels) { return labels.some(function (l) { return rectRectOverlap(l, x, y, width, height); }); });
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
function axisLabelsOverlap(data, padding) {
    var result = [];
    var _loop_2 = function (i) {
        var datum = data[i];
        var _a = datum.point, x = _a.x, y = _a.y, _b = datum.label, width = _b.width, height = _b.height, text = _b.text;
        width += (padding !== null && padding !== void 0 ? padding : 0);
        height += (padding !== null && padding !== void 0 ? padding : 0);
        var overlapLabels = result.some(function (l) {
            var overlap = rectRectOverlap(l, x, y, width, height);
            return overlap;
        });
        if (overlapLabels) {
            return { value: true };
        }
        result.push({
            index: i,
            text: text,
            x: x,
            y: y,
            width: width,
            height: height,
            datum: datum,
        });
    };
    for (var i = 0; i < data.length; i++) {
        var state_1 = _loop_2(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return false;
}
exports.axisLabelsOverlap = axisLabelsOverlap;
