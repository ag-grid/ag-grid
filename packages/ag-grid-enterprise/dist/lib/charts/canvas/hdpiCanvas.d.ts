// ag-grid-enterprise v21.0.1
declare type Size = {
    width: number;
    height: number;
};
export interface DownloadOptions {
    fileName?: string;
    background?: string;
}
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export declare class HdpiCanvas {
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    /**
     * The canvas flickers on size changes in Safari.
     * A temporary canvas is used (during resize only) to prevent that.
     */
    private tempCanvas;
    constructor(width?: number, height?: number);
    private _parent;
    parent: HTMLElement | undefined;
    private remove;
    destroy(): void;
    toImage(): HTMLImageElement;
    /**
     * @param options.fileName The `.png` extension is going to be added automatically.
     * @param [options.background] Defaults to `white`.
     */
    download(options?: DownloadOptions): void;
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
    private static _textMeasuringContext?;
    private static readonly textMeasuringContext;
    private static _svgText;
    private static readonly svgText;
    private static _has?;
    static readonly has: Readonly<{
        textMetrics: boolean;
        getTransform: boolean;
        flicker: boolean;
    }>;
    static measureText(text: string, font: string, textBaseline: CanvasTextBaseline, textAlign: CanvasTextAlign): TextMetrics;
    /**
     * Returns the width and height of the measured text.
     * @param text The single-line text to measure.
     * @param font The font shorthand string.
     */
    static getTextSize(text: string, font: string): Size;
    private static textSizeCache;
    private static measureSvgText;
    private static makeHdpiOverrides;
}
export {};
