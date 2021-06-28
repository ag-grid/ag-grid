export interface MeasuredLabel {
    readonly text: string;
    readonly width: number;
    readonly height: number;
}

export interface PlacedLabel extends MeasuredLabel {
    readonly index: number;
    readonly x: number;
    readonly y: number;
}

interface Datum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    },
    readonly size: number;
    readonly label: MeasuredLabel;
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

export function placeLabels(data: Datum[], bounds?: { x: number, y: number, width: number, height: number }): PlacedLabel[] {
    const result: PlacedLabel[] = [];

    data = data.slice().sort((a, b) => b.size - a.size);
    for (let i = 0, ln = data.length; i < ln; i++) {
        const d = data[i];
        const l = d.label;
        const r = d.size * 0.5;
        const x = d.point.x - l.width * 0.5;
        const y = d.point.y - r - l.height - 5;
        const { width, height } = l;

        const withinBounds = !bounds || rectContainsRect(bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
        if (!withinBounds) {
            continue;
        }

        const overlapPoints = data.some(d => circleRectOverlap(d.point.x, d.point.y, d.size * 0.5, x, y, width, height));
        if (overlapPoints) {
            continue;
        }

        const overlapLabels = result.some(l => rectRectOverlap(l.x, l.y, l.width, l.height, x, y, width, height));
        if (overlapLabels) {
            continue;
        }

        result.push({
            index: i,
            text: l.text,
            x,
            y,
            width,
            height
        });
    }

    return result;
}