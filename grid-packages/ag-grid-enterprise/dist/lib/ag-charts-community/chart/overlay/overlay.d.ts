import type { BBox } from '../../scene/bbox';
export declare class Overlay {
    constructor(className: string, parent: HTMLElement, document: Document);
    renderer?: () => string;
    text?: string;
    private className;
    private parentElement;
    private element?;
    private document;
    show(rect: BBox): void;
    hide(): void;
}
