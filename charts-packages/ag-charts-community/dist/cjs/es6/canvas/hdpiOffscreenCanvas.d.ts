declare type OffscreenCanvasRenderingContext2D = any;
declare type OffscreenCanvas = any;
/**
 * Wraps a native OffscreenCanvas and overrides its OffscreenCanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export declare class HdpiOffscreenCanvas {
    readonly context: OffscreenCanvasRenderingContext2D;
    readonly canvas: OffscreenCanvas;
    imageSource: ImageBitmap;
    enabled: boolean;
    opacity: number;
    static isSupported(): boolean;
    constructor({ width, height, overrideDevicePixelRatio }: {
        width?: number | undefined;
        height?: number | undefined;
        overrideDevicePixelRatio?: number | undefined;
    });
    snapshot(): void;
    destroy(): void;
    clear(): void;
    _pixelRatio: number;
    get pixelRatio(): number;
    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    setPixelRatio(ratio?: number): void;
    private _width;
    get width(): number;
    private _height;
    get height(): number;
    resize(width: number, height: number): void;
}
export {};
