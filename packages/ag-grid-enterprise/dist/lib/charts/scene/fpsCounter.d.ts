// ag-grid-enterprise v21.2.2
export declare class FpsCounter {
    constructor(parent?: HTMLElement, document?: Document);
    private fps;
    private minFps;
    private maxFps;
    private pastFps;
    private maxPastFps;
    private lastSecond;
    private readonly fpsElement?;
    countFrame(): void;
}
