// ag-grid-enterprise v20.2.0
/**
 * Creates an HTMLCanvasElement element with HDPI overrides applied.
 * The `width` and `height` parameters are optional and default to
 * the values defined in the W3C Recommendation:
 * https://www.w3.org/TR/html52/semantics-scripting.html#the-canvas-element
 * @param width
 * @param height
 */
export declare function createHdpiCanvas(width?: number, height?: number): HTMLCanvasElement;
export declare function applyHdpiOverrides(canvas: HTMLCanvasElement): number;
/**
 * Resizes the given Canvas element, taking HDPI overrides (if any) into account.
 * @param canvas
 * @param width
 * @param height
 */
export declare function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): void;
/**
 * Returns the position offset to apply to align vertical and horizontal
 * lines to the pixel grid for crisp look.
 * @param value Typically line width is assumed. Fractional values won't be aligned.
 * @param bias If alignment is necessary, which side to prefer.
 */
export declare function pixelSnap(value: number, bias?: PixelSnapBias): number;
export declare enum PixelSnapBias {
    Negative = -1,
    Positive = 1
}
