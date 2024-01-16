import type { BBox } from '../../scene/bbox';
export declare class Overlay {
    private className;
    private parentElement;
    private element?;
    constructor(className: string, parentElement: HTMLElement);
    renderer?: () => string;
    text?: string;
    show(rect: BBox): void;
    hide(): void;
    protected createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
}
