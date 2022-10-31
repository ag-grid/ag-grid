interface Size {
    width: number;
    height: number;
}
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
    set container(value: HTMLElement | undefined);
    get container(): HTMLElement | undefined;
    private remove;
    destroy(): void;
    clear(): void;
    toImage(): HTMLImageElement;
    getDataURL(type?: string): string;
    /**
     * @param fileName The name of the file upon save. The `.png` extension is going to be added automatically.
     */
    download(fileName?: string): void;
    _pixelRatio: number;
    get pixelRatio(): number;
    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    setPixelRatio(ratio?: number): void;
    set pixelated(value: boolean);
    get pixelated(): boolean;
    private _width;
    get width(): number;
    private _height;
    get height(): number;
    resize(width: number, height: number): void;
    private static _textMeasuringContext?;
    private static get textMeasuringContext();
    private static _svgText?;
    private static get svgText();
    private static _has?;
    static get has(): {
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
    static overrideScale(ctx: CanvasRenderingContext2D, scale: number): void;
}
export {};
