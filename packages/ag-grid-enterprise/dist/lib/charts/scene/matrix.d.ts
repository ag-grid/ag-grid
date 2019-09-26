// ag-grid-enterprise v21.2.2
import { BBox } from "./bbox";
/**
 * As of Jan 8, 2019, Firefox still doesn't implement
 * `getTransform(): DOMMatrix;`
 * `setTransform(transform?: DOMMatrix2DInit)`
 * in the `CanvasRenderingContext2D`.
 * Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=928150
 * IE11 and Edge 44 also don't have the support.
 * Thus this class, to keep track of the current transform and
 * combine transformations.
 * Standards:
 * https://html.spec.whatwg.org/dev/canvas.html
 * https://www.w3.org/TR/geometry-1/
 */
export declare class Matrix {
    readonly elements: number[];
    constructor(elements?: number[]);
    setElements(elements: number[]): Matrix;
    setIdentityElements(): this;
    readonly identity: boolean;
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    /**
     * Performs the AxB matrix multiplication and saves the result
     * to `C`, if given, or to `A` otherwise.
     */
    private AxB;
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
    preMultiplySelf(other: Matrix): Matrix;
    /**
     * Returns the inverse of this matrix as a new matrix.
     */
    inverse(): Matrix;
    /**
     * Save the inverse of this matrix to the given matrix.
     */
    inverseTo(other: Matrix): Matrix;
    invertSelf(): Matrix;
    clone(): Matrix;
    transformPoint(x: number, y: number): {
        x: number;
        y: number;
    };
    transformBBox(bbox: BBox, radius?: number, target?: BBox): BBox;
    toContext(ctx: CanvasRenderingContext2D): void;
    private static matrix;
    static flyweight(elements?: number[] | Matrix): Matrix;
}
