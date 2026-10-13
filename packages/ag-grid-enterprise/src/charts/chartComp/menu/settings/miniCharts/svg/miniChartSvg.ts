import type {
    MiniChartSvgCrispPart,
    MiniChartSvgPaint,
    MiniChartSvgShape,
    MiniChartSvgTemplate,
} from './miniChartSvgTypes';

const SVG_NS = 'http://www.w3.org/2000/svg';

const MINI_CHART_SIZE = 58;

const AXIS_LINES = [
    [5, 5, 5, 56],
    [3, 53, 54, 53],
];
const POLAR_CENTRE = MINI_CHART_SIZE / 2;
const POLAR_RINGS = [
    { r: 24, opacity: 0.5 },
    { r: 19.2, opacity: 0.2 },
    { r: 14.4, opacity: 0.2 },
    { r: 9.6, opacity: 0.2 },
];

type SvgAttrs = Record<string, string | number>;

/** The nearest device pixel boundary, rounding halves up as the canvas did. */
const toDevicePixels = (value: number, pixelRatio: number): number => Math.round(value * pixelRatio + 1e-8);

const QUARTER_ARC_HANDLE = (4 / 3) * Math.tan(Math.PI / 8);

/**
 * A circle as four cubic Béziers starting from its rightmost point, the way the canvas drew arcs, as browsers
 * anti-alias that path differently from a true `<circle>`.
 */
function circlePathData(cx: number, cy: number, r: number): string {
    const k = QUARTER_ARC_HANDLE * r;
    return [
        `M ${cx + r} ${cy}`,
        `C ${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r}`,
        `C ${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy}`,
        `C ${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r}`,
        `C ${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy}`,
    ].join(' ');
}

/** A vertical or horizontal line, moved so that its stroke covers whole device pixels as the canvas did. */
function crispLine(line: number[], strokeWidth: number, pixelRatio: number): number[] {
    const [x1, y1, x2, y2] = line;
    const strokeDevicePixels = Math.trunc(strokeWidth * pixelRatio);
    const snapCentre = (centre: number) =>
        strokeDevicePixels % 2 === 0
            ? toDevicePixels(centre, pixelRatio) / pixelRatio
            : (toDevicePixels(centre - 0.5 / pixelRatio, pixelRatio) + 0.5) / pixelRatio;
    if (x1 === x2) {
        return [snapCentre(x1), y1, snapCentre(x2), y2];
    }
    if (y1 === y2) {
        return [x1, snapCentre(y1), x2, snapCentre(y2)];
    }
    return line;
}

/**
 * Path data for parts snapped to device pixels the way the canvas thumbnails were: rectangle edges round to the
 * nearest device pixel, and a stroked rectangle is inset so that its outline falls inside those edges.
 */
function crispPathData(parts: MiniChartSvgCrispPart[], strokeWidth: number, pixelRatio: number): string {
    const snap = (value: number) => toDevicePixels(value, pixelRatio) / pixelRatio;
    return parts
        .map((part) => {
            if ('rect' in part) {
                const [x, y, width, height] = part.rect;
                const inset = strokeWidth / 2;
                const [x1, y1] = [snap(x) + inset, snap(y) + inset];
                const [x2, y2] = [snap(x + width) - inset, snap(y + height) - inset];
                return `M ${x1} ${y1} H ${x2} V ${y2} H ${x1} Z`;
            }
            const [x1, y1, x2, y2] = crispLine(part.line, strokeWidth, pixelRatio);
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        })
        .join(' ');
}

/** Draws a chart settings panel thumbnail as inline SVG, from geometry data and solid palette colours. */
export function createMiniChartSvg(
    container: HTMLElement,
    template: MiniChartSvgTemplate,
    fills: string[],
    strokes: string[],
    title: string
): void {
    const doc = container.ownerDocument;
    const pixelRatio = doc.defaultView?.devicePixelRatio ?? 1;
    const create = (tag: string, attrs: SvgAttrs = {}): Element => {
        const element = doc.createElementNS(SVG_NS, tag);
        for (const name of Object.keys(attrs)) {
            element.setAttribute(name, String(attrs[name]));
        }
        return element;
    };
    const resolve = (paint: MiniChartSvgPaint): string => {
        if (typeof paint === 'string') {
            return paint;
        }
        const colors = paint.palette === 'fills' ? fills : strokes;
        if (!colors.length || (paint.wrap === false && paint.index >= colors.length)) {
            return 'none';
        }
        return colors[paint.index % colors.length];
    };
    const createShape = (shape: MiniChartSvgShape): Element => {
        const { fill, stroke, attrs } = shape;
        let d: string;
        if ('circle' in shape) {
            const [cx, cy, r] = shape.circle;
            d = circlePathData(cx, cy, r);
        } else if (typeof shape.d === 'string') {
            d = shape.d;
        } else {
            d = crispPathData(shape.d, stroke ? Number(attrs?.['stroke-width'] ?? 1) : 0, pixelRatio);
        }
        const path = create('path', { d, ...attrs, fill: fill ? resolve(fill) : 'none' });
        if (stroke) {
            path.setAttribute('stroke', resolve(stroke));
        }
        return path;
    };

    const createAxes = (): Element[] => {
        if (template.axes === 'none') {
            return [];
        }
        if (template.axes === 'polar') {
            return POLAR_RINGS.map(({ r, opacity }) =>
                createShape({
                    circle: [POLAR_CENTRE, POLAR_CENTRE, r],
                    stroke: 'gray',
                    attrs: { 'stroke-width': 1, 'stroke-opacity': opacity },
                })
            );
        }
        return AXIS_LINES.map((line) => {
            const [x1, y1, x2, y2] = crispLine(line, 1, pixelRatio);
            return create('line', { x1, y1, x2, y2, 'stroke-width': 1, stroke: 'gray' });
        });
    };

    const svg = create('svg', {
        class: 'ag-chart-mini-thumbnail-svg',
        width: MINI_CHART_SIZE,
        height: MINI_CHART_SIZE,
        viewBox: `0 0 ${MINI_CHART_SIZE} ${MINI_CHART_SIZE}`,
        'aria-hidden': 'true',
        focusable: 'false',
    });

    const titleElement = create('title');
    titleElement.textContent = title;
    svg.appendChild(titleElement);

    const axes = createAxes();
    const [axesBeforeSeries, axesAfterSeries] = template.seriesOverAxes ? [axes, []] : [[], axes];
    svg.append(...axesBeforeSeries);

    // A nested viewport clips without needing a <defs> clipPath with a document-unique id.
    const createClip = ([x, y, width, height]: number[]) =>
        create('svg', { x, y, width, height, viewBox: `${x} ${y} ${width} ${height}`, overflow: 'hidden' });
    const seriesParent = template.clip ? svg.appendChild(createClip(template.clip)) : svg;
    for (const shape of template.series) {
        seriesParent.appendChild(createShape(shape));
    }
    svg.append(...axesAfterSeries);

    container.appendChild(svg);
}
