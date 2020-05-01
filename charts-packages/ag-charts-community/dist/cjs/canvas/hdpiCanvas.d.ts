declare type Size = {
    width: number;
    height: number;
};
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export declare class HdpiCanvas {
    readonly document: Document;
    readonly element: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    constructor(document?: Document, width?: number, height?: number);
    private _container;
    container: HTMLElement | undefined;
    private remove;
    destroy(): void;
    toImage(): HTMLImageElement;
    getDataURL(type?: string): string;
    /**
     * @param options.fileName The `.png` extension is going to be added automatically.
     * @param [options.background] Defaults to `white`.
     */
    download(fileName?: string): void;
    _pixelRatio: number;
    readonly pixelRatio: number;
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
    resize(width: number, height: number, callbackWhenDone?: () => void): void;
    private static _textMeasuringContext?;
    private static readonly textMeasuringContext;
    private static _svgText?;
    private static readonly svgText;
    private static _has?;
    static readonly has: {
        textMetrics: boolean;
        getTransform: boolean;
    };
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
