export type Size = {
    width: number;
    height: number;
};
type OffscreenCanvasRenderingContext2D = any;
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export declare class HdpiCanvas {
    static document: Document;
    readonly document: Document;
    readonly window: Window;
    readonly element: HTMLCanvasElement;
    readonly realContext: CanvasRenderingContext2D;
    readonly context: CanvasRenderingContext2D & {
        verifyDepthZero?: () => void;
    };
    readonly imageSource: HTMLCanvasElement;
    constructor(opts: {
        document: Document;
        window: Window;
        width?: number;
        height?: number;
        domLayer?: boolean;
        zIndex?: number;
        name?: string;
        overrideDevicePixelRatio?: number;
    });
    private _container?;
    set container(value: HTMLElement | undefined);
    get container(): HTMLElement | undefined;
    private _enabled;
    set enabled(value: boolean);
    get enabled(): boolean;
    private remove;
    destroy(): void;
    snapshot(): void;
    clear(): void;
    toImage(): HTMLImageElement;
    getDataURL(type?: string): string;
    /**
     * @param fileName The name of the downloaded file.
     * @param fileFormat The file format, the default is `image/png`
     */
    download(fileName?: string, fileFormat?: string): void;
    _pixelRatio: number;
    get pixelRatio(): number;
    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    private setPixelRatio;
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
    static overrideScale(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, scale: number): any;
}
export {};
