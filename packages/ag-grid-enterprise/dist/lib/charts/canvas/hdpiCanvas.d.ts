// ag-grid-enterprise v20.0.0
export declare class HdpiCanvas {
    constructor(width?: number, height?: number);
    _canvas: HTMLCanvasElement;
    readonly canvas: HTMLCanvasElement;
    destroy(): void;
    _pixelRatio: number;
    readonly pixelRatio: number;
    private overrides;
    /**
     * Updates the pixel ratio of the Canvas element with the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     * @param ratio
     * @param resize
     */
    updatePixelRatio(ratio?: number, resize?: boolean): void;
    resize(width: number, height: number): void;
    private static makeHdpiOverrides;
}
