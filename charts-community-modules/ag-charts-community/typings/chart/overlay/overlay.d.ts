import type { BBox } from '../../scene/bbox';
export declare class Overlay {
    constructor(className: string, parent: HTMLElement);
    renderer: (() => string) | undefined;
    text?: string;
    private className;
    private parentElement;
    private element?;
    show(rect: BBox): void;
    hide(): void;
}
//# sourceMappingURL=overlay.d.ts.map