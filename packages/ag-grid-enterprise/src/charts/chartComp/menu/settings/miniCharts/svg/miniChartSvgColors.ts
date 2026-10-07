import type { AgColorType, AgGradientColor, AgGradientColorStop, AgGradientType } from 'ag-charts-types';

import type { MiniChartSvgColorFn } from './miniChartSvgTypes';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FALLBACK_COLOR = 'gray';

type RuntimeGradientColor = AgGradientColor & { gradient?: AgGradientType; reverse?: boolean };

interface ResolvedStop {
    offset: number;
    color: string;
}

let gradientCounter = 0;

export const plainSlotColor: MiniChartSvgColorFn = (slot, fills, strokes) =>
    slot.palette === 'fills' ? fills[slot.index] : strokes[slot.index];

export function resolveSvgColor(color: AgColorType | undefined, palette: AgColorType[], svg: SVGSVGElement): string {
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
            return resolveGradient(color, palette, svg);
        case 'pattern':
            return typeof color.fill === 'string' ? color.fill : firstStringColor(palette);
        default:
            return firstStringColor(palette);
    }
}

function firstStringColor(palette: AgColorType[]): string {
    for (let i = 0; i < palette.length; i++) {
        const entry = palette[i];
        if (typeof entry === 'string') {
            return entry;
        }
    }
    return FALLBACK_COLOR;
}

function resolveGradient(color: RuntimeGradientColor, palette: AgColorType[], svg: SVGSVGElement): string {
    const { colorStops, gradient = 'linear', rotation = 0, reverse = false } = color;
    if (colorStops == null || colorStops.length === 0) {
        return firstStringColor(palette);
    }

    const stops = resolveStops(colorStops, reverse);
    if (gradient === 'conic') {
        return stops[0].color;
    }

    const doc = svg.ownerDocument;
    const element = doc.createElementNS(SVG_NS, gradient === 'radial' ? 'radialGradient' : 'linearGradient');
    if (gradient === 'radial') {
        element.setAttribute('cx', '0.5');
        element.setAttribute('cy', '0.5');
        element.setAttribute('r', '0.5');
    } else {
        const { x1, y1, x2, y2 } = linearGradientPoints(rotation);
        element.setAttribute('x1', String(x1));
        element.setAttribute('y1', String(y1));
        element.setAttribute('x2', String(x2));
        element.setAttribute('y2', String(y2));
    }
    for (let i = 0; i < stops.length; i++) {
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
    for (let i = 0; i < children.length; i++) {
        if (children[i].localName === 'defs') {
            return children[i];
        }
    }
    const defs = svg.ownerDocument.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
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
    for (let i = 0; i < count && lastColor == null; i++) {
        lastColor = stringColorOf(colorStops[i]);
    }

    for (let i = 0; i < count; i++) {
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
    for (let i = stops.length - 1; i >= 0; i--) {
        reversed.push({ offset: 1 - stops[i].offset, color: stops[i].color });
    }
    return reversed;
}

function findNextDefinedStop(colorStops: AgGradientColorStop[], from: number): number {
    for (let i = from + 1; i < colorStops.length; i++) {
        if (colorStops[i].stop != null) {
            return i;
        }
    }
    return colorStops.length - 1;
}

/** Endpoints over the unit `objectBoundingBox`, matching AG Charts' linear gradient geometry for square bounds. */
function linearGradientPoints(rotation: number): { x1: number; y1: number; x2: number; y2: number } {
    const degrees = (((rotation + 90) % 360) + 360) % 360;
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const diagonal = Math.SQRT2 / 2;
    const diagonalAngle = Math.PI / 4;

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
    return { x1: 0.5 + cos * length, y1: 0.5 + sin * length, x2: 0.5 - cos * length, y2: 0.5 - sin * length };
}
