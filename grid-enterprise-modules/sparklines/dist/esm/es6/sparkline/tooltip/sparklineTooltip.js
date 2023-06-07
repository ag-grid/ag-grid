export function toTooltipHtml(input, defaults) {
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
export class SparklineTooltip {
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
SparklineTooltip.class = 'ag-sparkline-tooltip';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcmtsaW5lVG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zcGFya2xpbmUvdG9vbHRpcC9zcGFya2xpbmVUb29sdGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVlBLE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBcUMsRUFBRSxRQUFnQzs7SUFDakcsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDM0IsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFFRCxRQUFRLEdBQUcsUUFBUSxhQUFSLFFBQVEsY0FBUixRQUFRLEdBQUksRUFBRSxDQUFDO0lBRTFCLE1BQU0sRUFDRixPQUFPLEdBQUcsTUFBQSxRQUFRLENBQUMsT0FBTyxtQ0FBSSxFQUFFLEVBQ2hDLEtBQUssR0FBRyxNQUFBLFFBQVEsQ0FBQyxLQUFLLG1DQUFJLFNBQVMsRUFDbkMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQ3RCLGVBQWUsR0FBRyxRQUFRLENBQUMsZUFBZSxFQUMxQyxPQUFPLEdBQUcsTUFBQSxRQUFRLENBQUMsT0FBTyxtQ0FBSSxDQUFDLEdBQ2xDLEdBQUcsS0FBSyxDQUFDO0lBRVYsSUFBSSxTQUFTLENBQUM7SUFDZCxJQUFJLFdBQVcsQ0FBQztJQUVoQixJQUFJLEtBQUssRUFBRTtRQUNQLFNBQVMsR0FBRyxLQUFLO1lBQ2IsQ0FBQyxDQUFDLGdCQUFnQixnQkFBZ0IsQ0FBQyxLQUFLLDBCQUEwQixLQUFLLEtBQUssS0FBSyxTQUFTO1lBQzFGLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDVCxXQUFXLEdBQUcsZ0JBQWdCLGdCQUFnQixDQUFDLEtBQUssMkJBQTJCLEtBQUssS0FBSyxPQUFPLFNBQVMsQ0FBQztLQUM3RztTQUFNO1FBQ0gsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLGdCQUFnQixDQUFDLEtBQUssV0FBVyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFD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