// ag-grid-enterprise v21.2.2
declare type Size = {
    width: number;
    height: number;
};
export declare type HdpiCanvasOptions = {
    width?: number;
    height?: number;
    document?: Document;
};
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export declare class HdpiCanvas {
    readonly document: Document;
    readonly element: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    /**
     * The canvas flickers on size changes in Safari.
     * A temporary canvas is used (during resize only) to prevent that.
     */
    private tempCanvas;
    constructor(options?: HdpiCanvasOptions);
    private _parent;
    parent: HTMLElement | undefined;
    private remove;
    destroy(): void;
    toImage(): HTMLImageElement;
    /**
     * @param options.fileName The `.png` extension is going to be added automatically.
     * @param [options.background] Defaults to `white`.
     */
    download(fileName?: string): void;
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
    private _width;
    readonly width: number;
    private _height;
    readonly height: number;
    resize(width: number, height: number): void;
    private _textMeasuringContext?;
    private readonly textMeasuringContext;
    private _svgText?;
    private readonly svgText;
    private _has?;
    readonly has: Readonly<{
        textMetrics: boolean;
        getTransform: boolean;
        flicker: boolean;
    }>;
    measureText(text: string, font: string, textBaseline: CanvasTextBaseline, textAlign: CanvasTextAlign): TextMetrics;
    /**
     * Returns the width and height of the measured text.
     * @param text The single-line text to measure.
     * @param font The font shorthand string.
     */
    getTextSize(text: string, font: string): Size;
    private static textSizeCache;
    private measureSvgText;
    private static makeHdpiOverrides;
}
export {};
