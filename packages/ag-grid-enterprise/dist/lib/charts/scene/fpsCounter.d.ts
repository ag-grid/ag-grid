export declare class FpsCounter {
    constructor(parent?: HTMLElement);
    private fps;
    private start;
    private minFps;
    private maxFps;
    private fpsSum;
    private fpsSamples;
    private readonly fpsElement?;
    countFrame(): void;
}
