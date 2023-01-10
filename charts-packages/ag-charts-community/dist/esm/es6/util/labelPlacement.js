function circleRectOverlap(c, x, y, w, h) {
    // Find closest horizontal and vertical edges.
    let edgeX = c.x < x ? x : c.x > x + w ? x + w : c.x;
    let edgeY = c.y < y ? y : c.y > y + h ? y + h : c.y;
    // Find distance to closest edges.
    const dx = c.x - edgeX;
    const dy = c.y - edgeY;
    const d = Math.sqrt(dx * dx + dy * dy);
    return d <= c.size * 0.5;
}
function rectRectOverlap(r1, x2, y2, w2, h2) {
    const xOverlap = r1.x + r1.width > x2 && r1.x < x2 + w2;
    const yOverlap = r1.y + r1.height > y2 && r1.y < y2 + h2;
    return xOverlap && yOverlap;
}
function rectContainsRect(r1, r2x, r2y, r2w, r2h) {
    return r2x + r2w < r1.x + r1.width && r2x > r1.x && r2y > r1.y && r2y + r2h < r1.y + r1.height;
}
export function isPointLabelDatum(x) {
    return x != null && typeof x.point === 'object' && typeof x.label === 'object';
}
/**
 * @param data Points and labels for one or more series. The order of series determines label placement precedence.
 * @param bounds Bounds to fit the labels into. If a label can't be fully contained, it doesn't fit.
 * @returns Placed labels for the given series (in the given order).
 */
export function placeLabels(data, bounds, padding = 5) {
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
            const withinBounds = !bounds || rectContainsRect(bounds, x, y, width, height);
            if (!withinBounds) {
                continue;
            }
            const overlapPoints = data.some((datum) => datum.some((d) => circleRectOverlap(d.point, x, y, width, height)));
            if (overlapPoints) {
                continue;
            }
            const overlapLabels = result.some((labels) => labels.some((l) => rectRectOverlap(l, x, y, width, height)));
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
export function axisLabelsOverlap(data, padding) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        let { point: { x, y }, label: { width, height, text }, } = datum;
        width += padding !== null && padding !== void 0 ? padding : 0;
        height += padding !== null && padding !== void 0 ? padding : 0;
        const overlapLabels = result.some((l) => {
            const overlap = rectRectOverlap(l, x, y, width, height);
            return overlap;
        });
        if (overlapLabels) {
            return true;
        }
        result.push({
            index: i,
            text,
            x,
            y,
            width,
            height,
            datum,
        });
    }
    return false;
}
