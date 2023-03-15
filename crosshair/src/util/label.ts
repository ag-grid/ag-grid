import { AgCrosshairLabelRendererResult } from 'ag-charts-community';
import { DEFAULT_LABEL_CLASS } from '../crosshairLabel';

export function toLabelHtml(input: string | AgCrosshairLabelRendererResult, defaults?: AgCrosshairLabelRendererResult): string {
    if (typeof input === 'string') {
        return input;
    }

    defaults = defaults || {};

    const {
        text = defaults.text || '',
        color = defaults.color,
        backgroundColor = undefined,
        opacity = defaults.opacity || 1,
    } = input;

    let contentHtml;

    if (color) {
        contentHtml = `<span class="${DEFAULT_LABEL_CLASS}-content" style="color: ${color}">${text}</span>`;
    } else {
        contentHtml = `<span class="${DEFAULT_LABEL_CLASS}-content">${text}</span>`;
    }

    let style = `opacity: ${opacity}`;
    if (backgroundColor) {
        style += `; background-color: ${backgroundColor.toLowerCase()}`;
    }

    return `<div class="${DEFAULT_LABEL_CLASS}-wrapper" style="${style}">
                ${contentHtml}
            </div>`;
}