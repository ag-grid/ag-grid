import { AgTooltipRendererResult } from "ag-charts-community";
import { DEFAULT_TOOLTIP_CLASS } from "../crosshairTooltip";

export function toTooltipHtml(input: string | AgTooltipRendererResult, defaults?: AgTooltipRendererResult): string {
    if (typeof input === 'string') {
        return input;
    }

    defaults = defaults || {};

    const {
        content = defaults.content || '',
        color = defaults.color,
        backgroundColor = undefined,
        opacity = defaults.opacity || 1,
    } = input;

    let contentHtml;

    if (color) {
        contentHtml = `<span class="${DEFAULT_TOOLTIP_CLASS}-content" style="color: ${color}">${content}</span>`;
    } else {
        contentHtml = `<span class="${DEFAULT_TOOLTIP_CLASS}-content">${content}</span>`;
    }

    let style = `opacity: ${opacity}`;
    if (backgroundColor) {
        style += `; background-color: ${backgroundColor.toLowerCase()}`;
    }

    return `<div class="${DEFAULT_TOOLTIP_CLASS}-wrapper" style="${style}">
                ${contentHtml}
            </div>`;
}