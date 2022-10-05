import { SizedPoint, Point } from '../scene/point';

export interface MeasuredLabel {
    readonly text: string;
    readonly width: number;
    readonly height: number;
}

export interface PlacedLabel<PLD = PointLabelDatum> extends MeasuredLabel, Readonly<Point> {
    readonly index: number;
    readonly datum: PLD;
}

export interface PointLabelDatum {
    readonly point: Readonly<SizedPoint>;
    readonly label: MeasuredLabel;
}

interface Bounds extends Readonly<Point> {
    readonly width: number;
    readonly height: number;
}

function circleRectOverlap(c: SizedPoint, x: number, y: number, w: number, h: number): boolean {
    // Find closest horizontal and vertical edges.
    let edgeX = c.x < x ? x : c.x > x + w ? x + w : c.x;
    let edgeY = c.y < y ? y : c.y > y + h ? y + h : c.y;
    // Find distance to closest edges.
    const dx = c.x - edgeX;
    const dy = c.y - edgeY;
    const d = Math.sqrt(dx * dx + dy * dy);
    return d <= c.size * 0.5;
}

function rectRectOverlap(r1: Bounds, x2: number, y2: number, w2: number, h2: number): boolean {
    const xOverlap = r1.x + r1.width > x2 && r1.x < x2 + w2;
    const yOverlap = r1.y + r1.height > y2 && r1.y < y2 + h2;
    return xOverlap && yOverlap;
}

export function isPointLabelDatum(x: any): x is PointLabelDatum {
    return x != null && typeof x.point === 'object' && typeof x.label === 'object';
}

/**
 * @param data Points and labels for one or more series. The order of series determines label placement precedence.
 * @param bounds Bounds to fit the labels into. If a label can't be fully contained, it doesn't fit.
 * @returns Placed labels for the given series (in the given order).
 */
export function placeLabels(
    data: readonly (readonly PointLabelDatum[])[],
    bounds?: Bounds,
    padding = 5
): PlacedLabel[][] {
    const result: PlacedLabel[][] = [];

    data = data.map((d) => d.slice().sort((a, b) => b.point.size - a.point.size));
    for (let j = 0; j < data.length; j++) {
        const labels: PlacedLabel[] = (result[j] = []);
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

            const withinBounds = !bounds || rectRectOverlap(bounds, x, y, width, height);
            if (!withinBounds) {
                continue;
            }

            const overlapPoints = data.some((datum) =>
                datum.some((d) => circleRectOverlap(d.point, x, y, width, height))
            );
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
