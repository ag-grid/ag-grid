"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function circleRectOverlap(cx, cy, r, x, y, w, h) {
    // Find closest horizontal and vertical edges.
    let edgeX = cx < x ? x : cx > x + w ? x + w : cx;
    let edgeY = cy < y ? y : cy > y + h ? y + h : cy;
    // Find distance to closest edges.
    const dx = cx - edgeX;
    const dy = cy - edgeY;
    const d = Math.sqrt(dx * dx + dy * dy);
    return d <= r;
}
function rectRectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    const xOverlap = x1 + w1 > x2 && x1 < x2 + w2;
    const yOverlap = y1 + h1 > y2 && y1 < y2 + h2;
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
function placeLabels(data, bounds, padding = 5) {
    const result = [];
    data = data.map((d) => d.slice().sort((a, b) => b.point.size - a.point.size));
    for (let j = 0; j < data.length; j++) {
        const labels = (result[j] = []);
        const datum = data[j];
        if (!(datum && datum.length && datum[0].label)) {
            continue;
        }
        for (let i = 0, ln = datum.length; i < ln; i++) {
            const d = datum[i];
            const l = d.label;
            const r = d.point.size * 0.5;
            const x = d.point.x - l.width * 0.5;
            const y = d.point.y - r - l.height - padding;
            const { width, height } = l;
            const withinBounds = !bounds || rectContainsRect(bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
            if (!withinBounds) {
                continue;
            }
            const overlapPoints = data.some((datum) => datum.some((d) => circleRectOverlap(d.point.x, d.point.y, d.point.size * 0.5, x, y, width, height)));
            if (overlapPoints) {
                continue;
            }
            const overlapLabels = result.some((labels) => labels.some((l) => rectRectOverlap(l.x, l.y, l.width, l.height, x, y, width, height)));
            if (overlapLabels) {
                continue;
            }
            labels.push({
                index: i,
                text: l.text,
                x,
                y,
                width,
                height,
                datum: d,
            });
        }
    }
    return result;
}
exports.placeLabels = placeLabels;
