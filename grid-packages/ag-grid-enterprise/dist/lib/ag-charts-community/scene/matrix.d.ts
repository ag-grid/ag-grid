import { BBox } from './bbox';
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
    private readonly elements;
    get e(): number[];
    constructor(elements?: number[]);
    setElements(elements: number[]): this;
    private get identity();
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
    multiplySelf(other: Matrix): this;
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns a new matrix.
     * @param other
     */
    multiply(other: Matrix): Matrix;
    preMultiplySelf(other: Matrix): this;
    /**
     * Returns the inverse of this matrix as a new matrix.
     */
    inverse(): Matrix;
    /**
     * Save the inverse of this matrix to the given matrix.
     */
    inverseTo(other: Matrix): this;
    invertSelf(): this;
    transformPoint(x: number, y: number): {
        x: number;
        y: number;
    };
    transformBBox(bbox: BBox, target?: BBox): BBox;
    toContext(ctx: CanvasTransform): void;
    private static instance;
    static flyweight(sourceMatrix: Matrix): Matrix;
    static updateTransformMatrix(matrix: Matrix, scalingX: number, scalingY: number, rotation: number, translationX: number, translationY: number, opts?: {
        scalingCenterX?: number | null;
        scalingCenterY?: number | null;
        rotationCenterX?: number | null;
        rotationCenterY?: number | null;
    }): Matrix;
    static fromContext(ctx: CanvasTransform): Matrix;
}
