// ag-grid-enterprise v21.2.2
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
