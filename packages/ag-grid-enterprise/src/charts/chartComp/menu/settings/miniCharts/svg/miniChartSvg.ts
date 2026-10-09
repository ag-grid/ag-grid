import type { MiniChartSvgPaint, MiniChartSvgShape, MiniChartSvgTemplate } from './miniChartSvgTypes';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const MINI_CHART_SIZE = 58;
export const MINI_CHART_PADDING = 5;

const PLOT_SIZE = MINI_CHART_SIZE - 2 * MINI_CHART_PADDING;
const AXIS_LINES = [
    { x1: 5.5, y1: 5, x2: 5.5, y2: 56 },
    { x1: 3, y1: 53.5, x2: 54, y2: 53.5 },
];
const POLAR_CENTRE = MINI_CHART_SIZE / 2;
const POLAR_RINGS = [
    { r: 24, opacity: 0.5 },
    { r: 19.2, opacity: 0.2 },
    { r: 14.4, opacity: 0.2 },
    { r: 9.6, opacity: 0.2 },
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
    const resolve = (paint: MiniChartSvgPaint): string => {
        if (typeof paint === 'string') {
            return paint;
        }
        const colors = paint.palette === 'fills' ? fills : strokes;
        return colors.length ? colors[paint.index % colors.length] : 'none';
    };
    const createShape = ({ d, fill, stroke, attrs }: MiniChartSvgShape): Element => {
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
                create('circle', {
                    cx: POLAR_CENTRE,
                    cy: POLAR_CENTRE,
                    r,
                    fill: 'none',
                    'stroke-width': 1,
                    stroke: 'gray',
                    'stroke-opacity': opacity,
                })
            );
        }
        return AXIS_LINES.map((axis) => create('line', { ...axis, 'stroke-width': 1, stroke: 'gray' }));
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
    svg.append(...axesAfterSeries);

    container.appendChild(svg);
}
