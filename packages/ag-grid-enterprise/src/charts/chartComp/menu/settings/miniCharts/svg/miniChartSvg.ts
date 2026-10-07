import type { AgColorType } from 'ag-charts-types';

import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { ChartTranslationService } from '../../../../services/chartTranslationService';
import { resolveSvgColor } from './miniChartSvgColors';
import type {
    MiniChartSvgColorFn,
    MiniChartSvgGroup,
    MiniChartSvgNode,
    MiniChartSvgPaint,
    MiniChartSvgShape,
    MiniChartSvgTemplate,
} from './miniChartSvgTypes';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 58;

export class MiniChartSvg extends Component {
    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }

    private readonly doc: Document;

    constructor(
        private readonly container: HTMLElement,
        private readonly template: MiniChartSvgTemplate,
        private readonly colors: MiniChartSvgColorFn,
        private readonly fills: AgColorType[],
        private readonly strokes: string[],
        private readonly isCustomTheme: boolean
    ) {
        super();
        this.doc = container.ownerDocument;
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

        this.appendNodes(svg, svg, this.template.children);
        this.container.appendChild(svg);
    }

    private appendNodes(svg: SVGSVGElement, parent: Element, nodes: MiniChartSvgNode[]): void {
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (node.tag === 'g') {
                this.appendGroup(svg, parent, node);
            } else {
                parent.appendChild(this.createShape(svg, node));
            }
        }
    }

    private appendGroup(svg: SVGSVGElement, parent: Element, group: MiniChartSvgGroup): void {
        const { clip, opacity, transform, children } = group;
        let outer = parent;
        let inner = parent;

        if (opacity != null || transform != null) {
            const g = this.createSvgElement('g');
            if (opacity != null) {
                g.setAttribute('opacity', String(opacity));
            }
            if (transform != null) {
                g.setAttribute('transform', transform);
            }
            outer = g;
            inner = g;
        }

        if (clip) {
            const [x, y, width, height] = clip;
            const nested = this.createSvgElement('svg');
            nested.setAttribute('x', String(x));
            nested.setAttribute('y', String(y));
            nested.setAttribute('width', String(width));
            nested.setAttribute('height', String(height));
            nested.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
            nested.setAttribute('overflow', 'hidden');
            inner.appendChild(nested);
            inner = nested;
        }

        this.appendNodes(svg, inner, children);
        if (outer !== parent) {
            parent.appendChild(outer);
        }
    }

    private createShape(svg: SVGSVGElement, shape: MiniChartSvgShape): Element {
        const element = this.createSvgElement(shape.tag);
        const attrNames = Object.keys(shape.attrs);
        for (let i = 0, len = attrNames.length; i < len; ++i) {
            const name = attrNames[i];
            element.setAttribute(name, String(shape.attrs[name]));
        }

        element.setAttribute('fill', shape.fill == null ? 'none' : this.resolvePaint(svg, shape.fill));
        if (shape.stroke != null) {
            element.setAttribute('stroke', this.resolvePaint(svg, shape.stroke));
        }
        return element;
    }

    private resolvePaint(svg: SVGSVGElement, paint: MiniChartSvgPaint): string {
        if (typeof paint === 'string') {
            return paint;
        }
        return resolveSvgColor(this.colors(paint, this.fills, this.strokes, this.isCustomTheme), this.fills, svg);
    }

    private createSvgElement<K extends 'svg' | 'g' | 'title' | 'path' | 'line'>(tag: K): SVGElementTagNameMap[K] {
        return this.doc.createElementNS(SVG_NS, tag);
    }
}
