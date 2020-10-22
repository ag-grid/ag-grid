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
    protected _fillOpacity: number;
    fillOpacity: number;
    protected _strokeOpacity: number;
    strokeOpacity: number;
    protected _fill: string | undefined;
    fill: string | undefined;
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
    protected _stroke: string | undefined;
    stroke: string | undefined;
    protected _strokeWidth: number;
    strokeWidth: number;
    readonly alignment: number;
    align(alignment: number, start: number, length?: number): number;
    protected _lineDash: number[] | undefined;
    lineDash: number[] | undefined;
    protected _lineDashOffset: number;
    lineDashOffset: number;
    protected _lineCap: ShapeLineCap;
    lineCap: ShapeLineCap;
    protected _lineJoin: ShapeLineJoin;
    lineJoin: ShapeLineJoin;
    protected _opacity: number;
    opacity: number;
    private readonly onShadowChange;
    protected _fillShadow: DropShadow | undefined;
    fillShadow: DropShadow | undefined;
    protected _strokeShadow: DropShadow | undefined;
    strokeShadow: DropShadow | undefined;
    protected fillStroke(ctx: CanvasRenderingContext2D): void;
    containsPoint(x: number, y: number): boolean;
    abstract isPointInPath(x: number, y: number): boolean;
    abstract isPointInStroke(x: number, y: number): boolean;
}
