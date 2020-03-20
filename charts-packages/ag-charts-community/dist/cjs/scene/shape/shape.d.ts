import { Node } from "../node";
import { DropShadow } from "../dropShadow";
export declare type ShapeLineCap = undefined | 'round' | 'square';
export declare type ShapeLineJoin = undefined | 'round' | 'bevel';
export declare abstract class Shape extends Node {
    /**
     * Creates a light-weight instance of the given shape (that serves as a template).
     * The created instance only stores the properites set on the instance itself
     * and the rest of the properties come via the prototype chain from the template.
     * This can greatly reduce memory usage in cases where one has many simular shapes,
     * for example, circles of different size, position and color. The exact memory usage
     * reduction will depend on the size of the template and the number of own properties
     * set on its lightweight instances, but will typically be around an order of magnitude
     * or more.
     *
     * Note: template shapes are not supposed to be part of the scene graph (they should not
     * have a parent).
     *
     * @param template
     */
    static createInstance<T extends Shape>(template: T): T;
    private lastInstanceId;
    /**
     * Defaults for style properties. Note that properties that affect the position
     * and shape of the node are not considered style properties, for example:
     * `x`, `y`, `width`, `height`, `radius`, `rotation`, etc.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnStyles` and `restoreAllStyles` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    protected static defaultStyles: {
        fill: string;
        stroke: any;
        strokeWidth: number;
        lineDash: any;
        lineDashOffset: number;
        lineCap: ShapeLineCap;
        lineJoin: ShapeLineJoin;
        opacity: number;
        fillShadow: any;
        strokeShadow: any;
    };
    /**
     * Restores the default styles introduced by this subclass.
     */
    protected restoreOwnStyles(): void;
    protected restoreAllStyles(): void;
    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    protected restoreOverriddenStyles(): void;
    private _fillOpacity;
    set fillOpacity(value: number);
    get fillOpacity(): number;
    private _strokeOpacity;
    set strokeOpacity(value: number);
    get strokeOpacity(): number;
    private _fill;
    set fill(value: string | undefined);
    get fill(): string | undefined;
    /**
     * Note that `strokeStyle = null` means invisible stroke,
     * while `lineWidth = 0` means no stroke, and sometimes this can mean different things.
     * For example, a rect shape with an invisible stroke may not align to the pixel grid
     * properly because the stroke affects the rules of alignment, and arc shapes forming
     * a pie chart will have a gap between them if they have an invisible stroke, whereas
     * there would be not gap if there was no stroke at all.
     * The preferred way of making the stroke invisible is setting the `lineWidth` to zero,
     * unless specific looks that is achieved by having an invisible stroke is desired.
     */
    private _stroke;
    set stroke(value: string | undefined);
    get stroke(): string | undefined;
    protected _strokeWidth: number;
    set strokeWidth(value: number);
    get strokeWidth(): number;
    private _lineDash;
    set lineDash(value: number[] | undefined);
    get lineDash(): number[] | undefined;
    private _lineDashOffset;
    set lineDashOffset(value: number);
    get lineDashOffset(): number;
    private _lineCap;
    set lineCap(value: ShapeLineCap);
    get lineCap(): ShapeLineCap;
    private _lineJoin;
    set lineJoin(value: ShapeLineJoin);
    get lineJoin(): ShapeLineJoin;
    private _opacity;
    set opacity(value: number);
    get opacity(): number;
    private readonly onShadowChange;
    private _fillShadow;
    set fillShadow(value: DropShadow | undefined);
    get fillShadow(): DropShadow | undefined;
    private _strokeShadow;
    set strokeShadow(value: DropShadow | undefined);
    get strokeShadow(): DropShadow | undefined;
    protected fillStroke(ctx: CanvasRenderingContext2D): void;
    isPointInNode(x: number, y: number): boolean;
    abstract isPointInPath(x: number, y: number): boolean;
    abstract isPointInStroke(x: number, y: number): boolean;
}
