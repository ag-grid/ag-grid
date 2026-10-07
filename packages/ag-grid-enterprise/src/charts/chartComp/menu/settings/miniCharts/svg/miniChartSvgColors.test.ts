import type { AgColorType } from 'ag-charts-types';

import { plainSlotColor, resolveSvgColor } from './miniChartSvgColors';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createSvg(): SVGSVGElement {
    return document.createElementNS(SVG_NS, 'svg');
}

function getGradient(svg: SVGSVGElement, color: string): Element {
    const id = /^url\(#(.+)\)$/.exec(color)?.[1];
    expect(id).toBeDefined();
    const gradient = svg.querySelector(`#${id}`);
    expect(gradient).not.toBeNull();
    return gradient!;
}

function stopsOf(gradient: Element): { offset: string | null; color: string | null }[] {
    const stops = gradient.querySelectorAll('stop');
    const result: { offset: string | null; color: string | null }[] = [];
    for (let i = 0; i < stops.length; i++) {
        result.push({ offset: stops[i].getAttribute('offset'), color: stops[i].getAttribute('stop-color') });
    }
    return result;
}

describe('resolveSvgColor', () => {
    const palette: AgColorType[] = [{ type: 'image', url: 'x.png' }, 'tomato', 'blue'];

    it('returns a string colour as-is', () => {
        expect(resolveSvgColor('#ff0000', palette, createSvg())).toBe('#ff0000');
    });

    it('returns none for an undefined colour', () => {
        expect(resolveSvgColor(undefined, palette, createSvg())).toBe('none');
    });

    it('creates a linear gradient in a lazily created leading defs', () => {
        const svg = createSvg();
        svg.appendChild(document.createElementNS(SVG_NS, 'path'));

        const color = resolveSvgColor(
            {
                type: 'gradient',
                rotation: 0,
                colorStops: [
                    { color: 'red', stop: 0 },
                    { color: 'blue', stop: 1 },
                ],
            },
            palette,
            svg
        );

        expect(color).toMatch(/^url\(#ag-mini-chart-gradient-\d+\)$/);
        expect(svg.firstElementChild?.localName).toBe('defs');
        const gradient = getGradient(svg, color);
        expect(gradient.localName).toBe('linearGradient');
        expect(gradient.parentElement).toBe(svg.firstElementChild);
        expect(stopsOf(gradient)).toEqual([
            { offset: '0', color: 'red' },
            { offset: '1', color: 'blue' },
        ]);
        expect(Number(gradient.getAttribute('x1'))).toBeCloseTo(0.5);
        expect(Number(gradient.getAttribute('y1'))).toBeCloseTo(1);
        expect(Number(gradient.getAttribute('x2'))).toBeCloseTo(0.5);
        expect(Number(gradient.getAttribute('y2'))).toBeCloseTo(0);
    });

    it('derives the linear gradient direction from the rotation', () => {
        const svg = createSvg();
        const color = resolveSvgColor(
            { type: 'gradient', rotation: 90, colorStops: [{ color: 'red' }, { color: 'blue' }] },
            palette,
            svg
        );

        const gradient = getGradient(svg, color);
        expect(Number(gradient.getAttribute('x1'))).toBeCloseTo(0);
        expect(Number(gradient.getAttribute('y1'))).toBeCloseTo(0.5);
        expect(Number(gradient.getAttribute('x2'))).toBeCloseTo(1);
        expect(Number(gradient.getAttribute('y2'))).toBeCloseTo(0.5);
    });

    it('distributes stops without a position evenly', () => {
        const svg = createSvg();
        const color = resolveSvgColor(
            { type: 'gradient', colorStops: [{ color: 'red' }, { color: 'green' }, { color: 'blue' }] },
            palette,
            svg
        );

        expect(stopsOf(getGradient(svg, color))).toEqual([
            { offset: '0', color: 'red' },
            { offset: '0.5', color: 'green' },
            { offset: '1', color: 'blue' },
        ]);
    });

    it('reverses the stops', () => {
        const svg = createSvg();
        const color = resolveSvgColor(
            {
                type: 'gradient',
                reverse: true,
                colorStops: [
                    { color: 'red', stop: 0 },
                    { color: 'blue', stop: 0.25 },
                ],
            } as AgColorType,
            palette,
            svg
        );

        expect(stopsOf(getGradient(svg, color))).toEqual([
            { offset: '0.75', color: 'blue' },
            { offset: '1', color: 'red' },
        ]);
    });

    it('creates a radial gradient', () => {
        const svg = createSvg();
        const color = resolveSvgColor(
            { type: 'gradient', gradient: 'radial', colorStops: [{ color: 'red' }, { color: 'blue' }] } as AgColorType,
            palette,
            svg
        );

        const gradient = getGradient(svg, color);
        expect(gradient.localName).toBe('radialGradient');
        expect(gradient.getAttribute('r')).toBe('0.5');
        expect(stopsOf(gradient)).toHaveLength(2);
    });

    it('reuses an existing defs element', () => {
        const svg = createSvg();
        const defs = document.createElementNS(SVG_NS, 'defs');
        svg.appendChild(defs);
        const gradient: AgColorType = { type: 'gradient', colorStops: [{ color: 'red' }, { color: 'blue' }] };

        resolveSvgColor(gradient, palette, svg);
        resolveSvgColor(gradient, palette, svg);

        expect(svg.querySelectorAll('defs')).toHaveLength(1);
        expect(defs.children).toHaveLength(2);
    });

    it('uses the first stop colour for a conic gradient without adding a definition', () => {
        const svg = createSvg();
        const color = resolveSvgColor(
            { type: 'gradient', gradient: 'conic', colorStops: [{ color: 'red' }, { color: 'blue' }] } as AgColorType,
            palette,
            svg
        );

        expect(color).toBe('red');
        expect(svg.querySelector('defs')).toBeNull();
    });

    it('falls back to the palette for a gradient with no stops', () => {
        const svg = createSvg();

        expect(resolveSvgColor({ type: 'gradient' }, palette, svg)).toBe('tomato');
        expect(resolveSvgColor({ type: 'gradient', colorStops: [] }, palette, svg)).toBe('tomato');
        expect(svg.querySelector('defs')).toBeNull();
    });

    it('uses the fill of a pattern', () => {
        expect(resolveSvgColor({ type: 'pattern', fill: 'purple' }, palette, createSvg())).toBe('purple');
    });

    it('falls back to the palette for a pattern without a fill', () => {
        expect(resolveSvgColor({ type: 'pattern' }, palette, createSvg())).toBe('tomato');
        expect(resolveSvgColor({ type: 'pattern' }, [], createSvg())).toBe('gray');
    });

    it('falls back to the palette for an image', () => {
        const image: AgColorType = { type: 'image', url: 'x.png' };

        expect(resolveSvgColor(image, palette, createSvg())).toBe('tomato');
        expect(resolveSvgColor(image, [image], createSvg())).toBe('gray');
    });

    it('falls back to the palette for a colour reference', () => {
        const ref = { ref: 'foregroundColor' } as unknown as AgColorType;

        expect(resolveSvgColor(ref, palette, createSvg())).toBe('tomato');
        expect(resolveSvgColor(ref, [], createSvg())).toBe('gray');
    });

    it('generates unique gradient ids across svgs', () => {
        const gradient: AgColorType = { type: 'gradient', colorStops: [{ color: 'red' }, { color: 'blue' }] };

        const first = resolveSvgColor(gradient, palette, createSvg());
        const second = resolveSvgColor(gradient, palette, createSvg());

        expect(first).not.toBe(second);
    });
});

describe('plainSlotColor', () => {
    const fills: AgColorType[] = ['red', 'green'];
    const strokes = ['darkred', 'darkgreen'];

    it('indexes the fills palette', () => {
        expect(plainSlotColor({ palette: 'fills', index: 1 }, fills, strokes, false)).toBe('green');
    });

    it('indexes the strokes palette', () => {
        expect(plainSlotColor({ palette: 'strokes', index: 0 }, fills, strokes, false)).toBe('darkred');
    });
});
