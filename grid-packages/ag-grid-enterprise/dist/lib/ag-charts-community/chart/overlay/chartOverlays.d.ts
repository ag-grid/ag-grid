import type { AnimationManager } from '../interaction/animationManager';
import { Overlay } from './overlay';
export declare class ChartOverlays {
    private static overlayDocuments;
    constructor(parent: HTMLElement, animationManager: AnimationManager);
    loading: Overlay;
    noData: Overlay;
    noVisibleSeries: Overlay;
    destroy(): void;
    private renderLoadingSpinner;
    protected createElement(parent: HTMLElement, tagName: string, options?: ElementCreationOptions): HTMLElement;
}
