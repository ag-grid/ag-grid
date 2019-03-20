// ag-grid-enterprise v20.2.0
export declare class FpsCounter {
    constructor(parent?: HTMLElement);
    private fps;
    private minFps;
    private maxFps;
    private pastFps;
    private maxPastFps;
    private lastSecond;
    private readonly fpsElement?;
    countFrame(): void;
}
