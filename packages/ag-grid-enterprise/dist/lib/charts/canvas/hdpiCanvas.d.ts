// ag-grid-enterprise v20.2.0
declare type Size = {
    width: number;
    height: number;
};
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export declare class HdpiCanvas {
    constructor(width?: number, height?: number);
    private _parent;
    parent: HTMLElement | null;
    private remove;
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    destroy(): void;
    toImage(): HTMLImageElement;
    /**
     * @param fileName The `.png` extension is going to be added automatically.
     */
    download(fileName: string): void;
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
    private static readonly textContext;
    private static _svgText;
    private static readonly svgText;
    static readonly supports: Readonly<{
        textMetrics: boolean;
        getTransform: boolean;
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
