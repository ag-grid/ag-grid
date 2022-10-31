import { Observable } from '../../util/observable';
import { TooltipRendererResult, TooltipRendererParams } from '@ag-grid-community/core';
export interface TooltipMeta {
    pageX: number;
    pageY: number;
}
export declare function toTooltipHtml(input: string | TooltipRendererResult, defaults?: TooltipRendererResult): string;
export declare class SparklineTooltip extends Observable {
    element: HTMLElement;
    static class: string;
    enabled: boolean;
    container?: HTMLElement;
    xOffset: number;
    yOffset: number;
    renderer?: (params: TooltipRendererParams) => string | TooltipRendererResult;
    constructor();
    isVisible(): boolean;
    updateClass(visible?: boolean): void;
    show(meta: TooltipMeta, html?: string): void;
    toggle(visible?: boolean): void;
    destroy(): void;
}
