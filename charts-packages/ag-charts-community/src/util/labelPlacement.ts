export interface MeasuredLabel {
    readonly text: string;
    readonly width: number;
    readonly height: number;
}

export interface PlacedLabel<PLD = PointLabelDatum> extends MeasuredLabel {
    readonly index: number;
    readonly x: number;
    readonly y: number;
    readonly datum: PLD;
}

export interface PointLabelDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly size: number;
    readonly label: MeasuredLabel;
}

interface Bounds {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

function circleRectOverlap(cx: number, cy: number, r: number, x: number, y: number, w: number, h: number): boolean {
    // Find closest horizontal and vertical edges.
    let edgeX = cx < x ? x : cx > x + w ? x + w : cx;
    let edgeY = cy < y ? y : cy > y + h ? y + h : cy;
    // Find distance to closest edges.
    const dx = cx - edgeX;
    const dy = cy - edgeY;
    const d = Math.sqrt((dx * dx) + (dy * dy));
    return d <= r;
}

function rectRectOverlap(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    const xOverlap = (x1 + w1) > x2 && x1 < (x2 + w2);
    const yOverlap = (y1 + h1) > y2 && y1 < (y2 + h2);
    return xOverlap && yOverlap;
}

function rectContainsRect(r1x: number, r1y: number, r1w: number, r1h: number, r2x: number, r2y: number, r2w: number, r2h: number) {
    return (r2x + r2w) < (r1x + r1w) && (r2x) > (r1x) && (r2y) > (r1y) && (r2y + r2h) < (r1y + r1h);
}

export function isPointLabelDatum(x: any): x is PointLabelDatum {
    return x != null && 
        typeof x.point === 'object' &&
        typeof x.size === 'number' &&
        typeof x.label === 'object';
}

/**
 * @param data Points and labels for one or more series. The order of series determines label placement precedence.
 * @param bounds Bounds to fit the labels into. If a label can't be fully contained, it doesn't fit.
 * @returns Placed labels for the given series (in the given order).
 */
export function placeLabels(data: readonly (readonly PointLabelDatum[])[], bounds?: Bounds, padding = 5): PlacedLabel[][] {
    const result: PlacedLabel[][] = [];

    data = data.map(d => d.slice().sort((a, b) => b.size - a.size));
    for (let j = 0; j < data.length; j++) {
        const labels: PlacedLabel[] = result[j] = [];
        const datum = data[j];
        if (!(datum && datum.length && datum[0].label)) {
            continue;
        }
        for (let i = 0, ln = datum.length; i < ln; i++) {
            const d = datum[i];
            const l = d.label;
            const r = d.size * 0.5;
            const x = d.point.x - l.width * 0.5;
            const y = d.point.y - r - l.height - padding;
            const { width, height } = l;

            const withinBounds = !bounds || rectContainsRect(bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
            if (!withinBounds) {
                continue;
            }

            const overlapPoints = data.some(datum => datum.some(d => circleRectOverlap(d.point.x, d.point.y, d.size * 0.5, x, y, width, height)));
            if (overlapPoints) {
                continue;
            }

            const overlapLabels = result.some(labels => labels.some(l => rectRectOverlap(l.x, l.y, l.width, l.height, x, y, width, height)));
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