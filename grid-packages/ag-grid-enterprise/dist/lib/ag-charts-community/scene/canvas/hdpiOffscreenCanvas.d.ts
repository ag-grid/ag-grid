type OffscreenCanvasRenderingContext2D = any;
type OffscreenCanvas = any;
interface OffscreenCanvasOptions {
    width: number;
    height: number;
    overrideDevicePixelRatio?: number;
}
/**
 * Wraps a native OffscreenCanvas and overrides its OffscreenCanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export declare class HdpiOffscreenCanvas {
    readonly realContext: OffscreenCanvasRenderingContext2D;
    readonly context: OffscreenCanvasRenderingContext2D & {
        verifyDepthZero?: () => void;
    };
    readonly canvas: OffscreenCanvas;
    imageSource: ImageBitmap;
    enabled: boolean;
    static isSupported(): boolean;
    constructor({ width, height, overrideDevicePixelRatio }: OffscreenCanvasOptions);
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
    private setPixelRatio;
    private _width;
    get width(): number;
    private _height;
    get height(): number;
    resize(width: number, height: number): void;
}
export {};
