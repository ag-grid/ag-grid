import type { AgColorType, AgGradientColor, AgGradientColorStop, AgGradientType } from 'ag-charts-types';

import type { MiniChartSvgColorFn, MiniChartSvgShape } from './miniChartSvgTypes';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FALLBACK_COLOR = 'gray';

type RuntimeGradientColor = AgGradientColor & { gradient?: AgGradientType; reverse?: boolean };

interface ResolvedStop {
    offset: number;
    color: string;
}

interface BBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

const NUMBER_PATTERN = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

let gradientCounter = 0;

export const plainSlotColor: MiniChartSvgColorFn = (slot, fills, strokes) =>
    slot.palette === 'fills' ? fills[slot.index] : strokes[slot.index];

export function resolveSvgColor(
    color: AgColorType | undefined,
    palette: AgColorType[],
    svg: SVGSVGElement,
    shape: MiniChartSvgShape
): string {
    if (color == null) {
        return 'none';
    }
    if (typeof color === 'string') {
        return color;
    }
    if (!('type' in color)) {
        return firstStringColor(palette);
    }
    switch (color.type) {
        case 'gradient':
            return resolveGradient(color, palette, svg, shape);
        case 'pattern':
            return typeof color.fill === 'string' ? color.fill : firstStringColor(palette);
        default:
            return firstStringColor(palette);
    }
}

function firstStringColor(palette: AgColorType[]): string {
    for (let i = 0, len = palette.length; i < len; ++i) {
        const entry = palette[i];
        if (typeof entry === 'string') {
            return entry;
        }
    }
    return FALLBACK_COLOR;
}

function resolveGradient(
    color: RuntimeGradientColor,
    palette: AgColorType[],
    svg: SVGSVGElement,
    shape: MiniChartSvgShape
): string {
    const { colorStops, gradient = 'linear', rotation = 0, reverse = false } = color;
    if (colorStops == null || colorStops.length === 0) {
        return firstStringColor(palette);
    }

    const stops = resolveStops(colorStops, reverse);
    if (gradient === 'conic') {
        return stops[0].color;
    }

    // userSpaceOnUse, as objectBoundingBox paints nothing on a zero-height shape such as a flat line.
    const bbox = getShapeBBox(shape);
    const doc = svg.ownerDocument;
    const element = doc.createElementNS(SVG_NS, gradient === 'radial' ? 'radialGradient' : 'linearGradient');
    element.setAttribute('gradientUnits', 'userSpaceOnUse');
    if (gradient === 'radial') {
        const { x, y, width, height } = bbox;
        element.setAttribute('cx', String(x + width / 2));
        element.setAttribute('cy', String(y + height / 2));
        element.setAttribute('r', String(Math.hypot(width / 2, height / 2) / Math.SQRT2));
    } else {
        const { x1, y1, x2, y2 } = linearGradientPoints(rotation, bbox);
        element.setAttribute('x1', String(x1));
        element.setAttribute('y1', String(y1));
        element.setAttribute('x2', String(x2));
        element.setAttribute('y2', String(y2));
    }
    for (let i = 0, len = stops.length; i < len; ++i) {
        const stopElement = doc.createElementNS(SVG_NS, 'stop');
        stopElement.setAttribute('offset', String(stops[i].offset));
        stopElement.setAttribute('stop-color', stops[i].color);
        element.appendChild(stopElement);
    }

    const id = `ag-mini-chart-gradient-${gradientCounter++}`;
    element.setAttribute('id', id);
    getOrCreateDefs(svg).appendChild(element);
    return `url(#${id})`;
}

function getOrCreateDefs(svg: SVGSVGElement): Element {
    const children = svg.children;
    for (let i = 0, len = children.length; i < len; ++i) {
        if (children[i].localName === 'defs') {
            return children[i];
        }
    }
    const defs = svg.ownerDocument.createElementNS(SVG_NS, 'defs');
    const first = svg.firstElementChild;
    svg.insertBefore(defs, first?.localName === 'title' ? first.nextSibling : first);
    return defs;
}

function stringColorOf(stop: AgGradientColorStop): string | undefined {
    return typeof stop.color === 'string' ? stop.color : undefined;
}

/** Mirrors AG Charts' even distribution of stops that have no explicit position, over the unit domain. */
function resolveStops(colorStops: AgGradientColorStop[], reverse: boolean): ResolvedStop[] {
    const count = colorStops.length;
    const stops: ResolvedStop[] = [];
    let previousDefined = 0;
    let nextDefined = -1;
    let lastColor: string | undefined;
    for (let i = 0; i < count && lastColor == null; ++i) {
        lastColor = stringColorOf(colorStops[i]);
    }

    for (let i = 0; i < count; ++i) {
        if (i >= nextDefined) {
            nextDefined = findNextDefinedStop(colorStops, i);
        }
        const stop = colorStops[i].stop;
        let offset: number;
        if (stop == null) {
            const start = colorStops[previousDefined].stop ?? 0;
            const end = colorStops[nextDefined].stop ?? 1;
            const span = nextDefined - previousDefined;
            offset = span > 0 ? start + ((end - start) * (i - previousDefined)) / span : start;
        } else {
            offset = stop;
            previousDefined = i;
        }

        lastColor = stringColorOf(colorStops[i]) ?? lastColor;
        stops.push({ offset: Math.max(0, Math.min(1, offset)), color: lastColor ?? 'black' });
    }

    if (!reverse) {
        return stops;
    }
    const reversed: ResolvedStop[] = [];
    for (let i = stops.length - 1; i >= 0; --i) {
        reversed.push({ offset: 1 - stops[i].offset, color: stops[i].color });
    }
    return reversed;
}

function findNextDefinedStop(colorStops: AgGradientColorStop[], from: number): number {
    for (let i = from + 1, len = colorStops.length; i < len; ++i) {
        if (colorStops[i].stop != null) {
            return i;
        }
    }
    return colorStops.length - 1;
}

/** Templates emit only absolute M/L/Z paths, so the numbers in `d` are x/y pairs. */
function getShapeBBox(shape: MiniChartSvgShape): BBox {
    const attrs = shape.attrs;
    const coords =
        shape.tag === 'line'
            ? [attrs.x1, attrs.y1, attrs.x2, attrs.y2].map(Number)
            : (String(attrs.d).match(NUMBER_PATTERN) ?? []).map(Number);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0, len = coords.length - 1; i < len; i += 2) {
        const x = coords[i];
        const y = coords[i + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Mirrors AG Charts' linear gradient geometry over the shape's bounds. */
function linearGradientPoints(rotation: number, bbox: BBox): { x1: number; y1: number; x2: number; y2: number } {
    const { x, y, width, height } = bbox;
    const degrees = (((rotation + 90) % 360) + 360) % 360;
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const cx = x + width / 2;
    const cy = y + height / 2;
    const diagonal = Math.hypot(width, height) / 2;
    const diagonalAngle = Math.atan2(height, width);

    let quarteredAngle: number;
    if (radians < Math.PI / 2) {
        quarteredAngle = radians;
    } else if (radians < Math.PI) {
        quarteredAngle = Math.PI - radians;
    } else if (radians < 1.5 * Math.PI) {
        quarteredAngle = radians - Math.PI;
    } else {
        quarteredAngle = 2 * Math.PI - radians;
    }
    const length = diagonal * Math.abs(Math.cos(quarteredAngle - diagonalAngle));
    return { x1: cx + cos * length, y1: cy + sin * length, x2: cx - cos * length, y2: cy - sin * length };
}
