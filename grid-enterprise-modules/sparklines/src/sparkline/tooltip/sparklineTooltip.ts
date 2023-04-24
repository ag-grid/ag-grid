import { TooltipRendererResult } from '@ag-grid-community/core';

export interface SparklineTooltipMeta {
    pageX: number;
    pageY: number;
    position?: {
        xOffset?: number;
        yOffset?: number;
    };
    container?: HTMLElement;
}

export function toTooltipHtml(input: string | TooltipRendererResult, defaults?: TooltipRendererResult): string {
    if (typeof input === 'string') {
        return input;
    }

    defaults = defaults || {};

    const {
        content = defaults.content || '',
        title = defaults.title || undefined,
        color = defaults.color,
        backgroundColor = defaults.backgroundColor,
        opacity = defaults.opacity || 1,
    } = input;

    let titleHtml;
    let contentHtml;

    if (color) {
        titleHtml = title
            ? `<span class="${SparklineTooltip.class}-title"; style="color: ${color}">${title}</span>`
            : '';
        contentHtml = `<span class="${SparklineTooltip.class}-content" style="color: ${color}">${content}</span>`;
    } else {
        titleHtml = title ? `<span class="${SparklineTooltip.class}-title">${title}</span>` : '';
        contentHtml = `<span class="${SparklineTooltip.class}-content">${content}</span>`;
    }

    let style = `opacity: ${opacity}`;
    if (backgroundColor) {
        style += `; background-color: ${backgroundColor.toLowerCase()}`;
    }

    return `<div class="${SparklineTooltip.class}" style="${style}">
                ${titleHtml}
                ${contentHtml}
            </div>`;
}

export class SparklineTooltip {
    element: HTMLElement = document.createElement('div');

    static class: string = 'ag-sparkline-tooltip';

    constructor() {
        const tooltipRoot = document.body;
        tooltipRoot.appendChild(this.element);
    }

    isVisible(): boolean {
        const { element } = this;
        if (element.classList) {
            return !element.classList.contains(`${SparklineTooltip.class}-wrapper-hidden`);
        }

        // IE11
        const classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(`${SparklineTooltip.class}-wrapper-hidden`) < 0;
        }

        return false;
    }

    updateClass(visible?: boolean) {
        const classList = [`${SparklineTooltip.class}-wrapper`];

        if (visible !== true) {
            classList.push(`${SparklineTooltip.class}-wrapper-hidden`);
        }

        this.element.setAttribute('class', classList.join(' '));
    }

    show(meta: SparklineTooltipMeta, html?: string) {
        this.toggle(false);

        const { element } = this;

        if (html !== undefined) {
            element.innerHTML = html;
        } else if (!element.innerHTML) {
            return;
        }

        const xOffset = meta.position?.xOffset ?? 10;
        const yOffset = meta.position?.yOffset ?? 0;

        let left = meta.pageX + xOffset;
        let top = meta.pageY + yOffset;

        const tooltipRect = element.getBoundingClientRect();

        let maxLeft = window.innerWidth - tooltipRect.width;

        if (meta.container) {
            const containerRect = meta.container.getBoundingClientRect();

            maxLeft = containerRect.left + (containerRect.width - tooltipRect.width);
        }

        if (left > maxLeft) {
            left = meta.pageX - element.clientWidth - xOffset;
        }

        if (typeof scrollX !== 'undefined') {
            left += scrollX;
        }
        if (typeof scrollY !== 'undefined') {
            top += scrollY;
        }

        element.style.left = `${Math.round(left)}px`;
        element.style.top = `${Math.round(top)}px`;

        this.toggle(true);
    }

    toggle(visible?: boolean) {
        this.updateClass(visible);
    }

    destroy() {
        const { parentNode } = this.element;

        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    }
}
