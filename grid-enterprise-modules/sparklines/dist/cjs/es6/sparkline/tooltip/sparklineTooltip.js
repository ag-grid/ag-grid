"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklineTooltip = exports.toTooltipHtml = void 0;
function toTooltipHtml(input, defaults) {
    var _a, _b, _c;
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults !== null && defaults !== void 0 ? defaults : {};
    const { content = (_a = defaults.content) !== null && _a !== void 0 ? _a : '', title = (_b = defaults.title) !== null && _b !== void 0 ? _b : undefined, color = defaults.color, backgroundColor = defaults.backgroundColor, opacity = (_c = defaults.opacity) !== null && _c !== void 0 ? _c : 1, } = input;
    let titleHtml;
    let contentHtml;
    if (color) {
        titleHtml = title
            ? `<span class="${SparklineTooltip.class}-title"; style="color: ${color}">${title}</span>`
            : '';
        contentHtml = `<span class="${SparklineTooltip.class}-content" style="color: ${color}">${content}</span>`;
    }
    else {
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
exports.toTooltipHtml = toTooltipHtml;
class SparklineTooltip {
    constructor() {
        this.element = document.createElement('div');
        const tooltipRoot = document.body;
        tooltipRoot.appendChild(this.element);
    }
    isVisible() {
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
    updateClass(visible) {
        const classList = [`${SparklineTooltip.class}-wrapper`];
        if (visible !== true) {
            classList.push(`${SparklineTooltip.class}-wrapper-hidden`);
        }
        this.element.setAttribute('class', classList.join(' '));
    }
    show(meta, html) {
        var _a, _b, _c, _d;
        this.toggle(false);
        const { element } = this;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            return;
        }
        const xOffset = (_b = (_a = meta.position) === null || _a === void 0 ? void 0 : _a.xOffset) !== null && _b !== void 0 ? _b : 10;
        const yOffset = (_d = (_c = meta.position) === null || _c === void 0 ? void 0 : _c.yOffset) !== null && _d !== void 0 ? _d : 0;
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
    toggle(visible) {
        this.updateClass(visible);
    }
    destroy() {
        const { parentNode } = this.element;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    }
}
exports.SparklineTooltip = SparklineTooltip;
SparklineTooltip.class = 'ag-sparkline-tooltip';
