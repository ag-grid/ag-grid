// ag-grid-enterprise v20.0.0
/**
 * As of Jan 8, 2019, Firefox still doesn't implement
 * `getTransform(): DOMMatrix;`
 * `setTransform(transform?: DOMMatrix2DInit)`
 * in the `CanvasRenderingContext2D`.
 * Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=928150
 * IE11 and Edge 44 also don't have the support.
 * Thus this class, to keep track of the current transform and
 * combine transformations.
 * Standards: https://html.spec.whatwg.org/dev/canvas.html
 *           https://www.w3.org/TR/geometry-1/
 */
export declare class Matrix {
    private elements;
    constructor(elements?: number[]);
    setElements(elements: number[]): Matrix;
    readonly isIdentity: boolean;
    _a: number;
    a: number;
    _b: number;
    b: number;
    _c: number;
    c: number;
    _d: number;
    d: number;
    _e: number;
    e: number;
    _f: number;
    f: number;
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns the current matrix.
     * @param other
     */
    multiplySelf(other: Matrix): Matrix;
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns a new matrix.
     * @param other
     */
    multiply(other: Matrix): Matrix;
    inverse(): Matrix;
    invertSelf(): Matrix;
}
