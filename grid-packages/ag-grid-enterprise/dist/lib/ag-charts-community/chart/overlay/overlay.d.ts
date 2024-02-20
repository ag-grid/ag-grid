import type { BBox } from '../../scene/bbox';
import type { AnimationManager } from '../interaction/animationManager';
export declare const DEFAULT_OVERLAY_CLASS = "ag-chart-overlay";
export declare const DEFAULT_OVERLAY_DARK_CLASS = "ag-chart-dark-overlay";
export declare class Overlay {
    private className;
    private parentElement;
    private animationManager;
    private element?;
    constructor(className: string, parentElement: HTMLElement, animationManager: AnimationManager);
    renderer?: () => string;
    text?: string;
    darkTheme: boolean;
    show(rect: BBox): void;
    hide(): void;
    protected createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
}
