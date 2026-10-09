import type { MiniChartSvgShape, MiniChartSvgSlot, MiniChartSvgTemplate } from './miniChartSvgTypes';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const MINI_CHART_SIZE = 58;
export const MINI_CHART_PADDING = 5;

const PLOT_SIZE = MINI_CHART_SIZE - 2 * MINI_CHART_PADDING;
const AXIS_LINES = [
    { x1: 5.5, y1: 5, x2: 5.5, y2: 56 },
    { x1: 3, y1: 53.5, x2: 54, y2: 53.5 },
];

type SvgAttrs = Record<string, string | number>;

/** Draws a chart settings panel thumbnail as inline SVG, from geometry data and solid palette colours. */
export function createMiniChartSvg(
    container: HTMLElement,
    template: MiniChartSvgTemplate,
    fills: string[],
    strokes: string[],
    title: string
): void {
    const doc = container.ownerDocument;
    const create = (tag: string, attrs: SvgAttrs = {}): Element => {
        const element = doc.createElementNS(SVG_NS, tag);
        for (const name of Object.keys(attrs)) {
            element.setAttribute(name, String(attrs[name]));
        }
        return element;
    };
    const resolve = ({ palette, index }: MiniChartSvgSlot): string => {
        const colors = palette === 'fills' ? fills : strokes;
        return colors.length ? colors[index % colors.length] : 'none';
    };
    const createShape = ({ d, fill, stroke, attrs }: MiniChartSvgShape): Element => {
        const path = create('path', { d, ...attrs, fill: fill ? resolve(fill) : 'none' });
        if (stroke) {
            path.setAttribute('stroke', resolve(stroke));
        }
        return path;
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

    // A nested viewport clips without needing a <defs> clipPath with a document-unique id.
    const seriesParent = template.clip
        ? svg.appendChild(
              create('svg', {
                  x: MINI_CHART_PADDING,
                  y: MINI_CHART_PADDING,
                  width: PLOT_SIZE,
                  height: PLOT_SIZE,
                  viewBox: `${MINI_CHART_PADDING} ${MINI_CHART_PADDING} ${PLOT_SIZE} ${PLOT_SIZE}`,
                  overflow: 'hidden',
              })
          )
        : svg;
    for (const shape of template.series) {
        seriesParent.appendChild(createShape(shape));
    }

    for (const axis of AXIS_LINES) {
        svg.appendChild(create('line', { ...axis, 'stroke-width': 1, stroke: 'gray' }));
    }

    container.appendChild(svg);
}
