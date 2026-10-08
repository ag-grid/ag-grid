import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { ChartTranslationService } from '../../../../services/chartTranslationService';
import type {
    MiniChartSvgGroup,
    MiniChartSvgNode,
    MiniChartSvgPaint,
    MiniChartSvgShape,
    MiniChartSvgTemplate,
} from './miniChartSvgTypes';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 58;

/** Draws a chart settings panel thumbnail as inline SVG, from geometry data and solid palette colours. */
export class MiniChartSvg extends Component {
    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }

    constructor(
        private readonly container: HTMLElement,
        private readonly template: MiniChartSvgTemplate,
        private readonly fills: string[],
        private readonly strokes: string[]
    ) {
        super();
    }

    public postConstruct(): void {
        const svg = this.createSvgElement('svg');
        svg.setAttribute('class', 'ag-chart-mini-thumbnail-svg');
        svg.setAttribute('width', String(SIZE));
        svg.setAttribute('height', String(SIZE));
        svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        const title = this.createSvgElement('title');
        title.textContent = this.chartTranslation.translate(this.template.tooltip);
        svg.appendChild(title);

        this.appendNodes(svg, this.template.children);
        this.container.appendChild(svg);
    }

    private appendNodes(parent: Element, nodes: MiniChartSvgNode[]): void {
        for (const node of nodes) {
            parent.appendChild(node.tag === 'g' ? this.createGroup(node) : this.createShape(node));
        }
    }

    private createGroup({ clip, transform, children }: MiniChartSvgGroup): Element {
        const g = this.createSvgElement('g');
        if (transform != null) {
            g.setAttribute('transform', transform);
        }

        let inner: Element = g;
        if (clip) {
            // A nested viewport clips without needing a <defs> clipPath with a document-unique id.
            const [x, y, width, height] = clip;
            const nested = this.createSvgElement('svg');
            nested.setAttribute('x', String(x));
            nested.setAttribute('y', String(y));
            nested.setAttribute('width', String(width));
            nested.setAttribute('height', String(height));
            nested.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
            nested.setAttribute('overflow', 'hidden');
            g.appendChild(nested);
            inner = nested;
        }

        this.appendNodes(inner, children);
        return g;
    }

    private createShape({ tag, attrs, fill, stroke }: MiniChartSvgShape): Element {
        const element = this.createSvgElement(tag);
        for (const name of Object.keys(attrs)) {
            element.setAttribute(name, String(attrs[name]));
        }
        element.setAttribute('fill', fill == null ? 'none' : this.resolvePaint(fill));
        if (stroke != null) {
            element.setAttribute('stroke', this.resolvePaint(stroke));
        }
        return element;
    }

    private resolvePaint(paint: MiniChartSvgPaint): string {
        if (typeof paint === 'string') {
            return paint;
        }
        const palette = paint.palette === 'fills' ? this.fills : this.strokes;
        return palette.length ? palette[paint.index % palette.length] : 'none';
    }

    private createSvgElement<K extends 'svg' | 'g' | 'title' | 'path' | 'line'>(tag: K): SVGElementTagNameMap[K] {
        return this.container.ownerDocument.createElementNS(SVG_NS, tag);
    }
}
