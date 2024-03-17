import { TooltipRendererResult } from 'ag-grid-community';
export interface SparklineTooltipMeta {
    pageX: number;
    pageY: number;
    position?: {
        xOffset?: number;
        yOffset?: number;
    };
    container?: HTMLElement;
}
export declare function toTooltipHtml(input: string | TooltipRendererResult, defaults?: TooltipRendererResult): string;
export declare class SparklineTooltip {
    element: HTMLElement;
    static class: string;
    constructor();
    isVisible(): boolean;
    updateClass(visible?: boolean): void;
    show(meta: SparklineTooltipMeta, html?: string): void;
    toggle(visible?: boolean): void;
    destroy(): void;
}
