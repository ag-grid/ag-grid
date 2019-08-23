import { Shape } from "./shape";
import { Path2D } from "../path2D";
import { BBox } from "../bbox";
import { normalizeAngle360 } from "../../util/angle";
import { chainObjects } from "../../util/object";
import { isEqual } from "../../util/number";

export enum ArcType {
    Open,
    Chord,
    Round
}

/**
 * Elliptical arc node.
 */
export class Arc extends Shape {

    static className = 'Arc';

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        lineWidth: 1,
        fillStyle: null
    });

    // Declare a path to retain for later rendering and hit testing
    // using custom Path2D class. It's pure TypeScript and works in all browsers.
    protected path = new Path2D();

    constructor() {
        super();
        this.restoreOwnStyles();
    }

    static create(centerX: number, centerY: number, radiusX: number, radiusY: number = radiusX,
                  startAngle: number = 0, endAngle: number = Math.PI * 2, counterClockwise = false): Arc {
        const arc = new Arc();

        arc.centerX = centerX;
        arc.centerY = centerY;
        arc.radiusX = radiusX;
        arc.radiusY = radiusY;
        arc.startAngle = startAngle;
        arc.endAngle = endAngle;
        arc.counterClockwise = counterClockwise;

        return arc;
    }

    /**
     * It's not always that the path has to be updated.
     * For example, if transform attributes (such as `translationX`)
     * are changed, we don't have to update the path. The `dirtyFlag`
     * is how we keep track if the path has to be updated or not.
     */
    private _dirtyPath = true;
    set dirtyPath(value: boolean) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyPath(): boolean {
        return this._dirtyPath;
    }

    private _centerX: number = 0;
    set centerX(value: number) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.dirtyPath = true;
        }
    }
    get centerX(): number {
        return this._centerX;
    }

    private _centerY: number = 0;
    set centerY(value: number) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.dirtyPath = true;
        }
    }
    get centerY(): number {
        return this._centerY;
    }

    private _radiusX: number = 10;
    set radiusX(value: number) {
        if (this._radiusX !== value) {
            this._radiusX = value;
            this.dirtyPath = true;
        }
    }
    get radiusX(): number {
        return this._radiusX;
    }

    private _radiusY: number = 10;
    set radiusY(value: number) {
        if (this._radiusY !== value) {
            this._radiusY = value;
            this.dirtyPath = true;
        }
    }
    get radiusY(): number {
        return this._radiusY;
    }

    private _startAngle: number = 0;
    set startAngle(value: number) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.dirtyPath = true;
        }
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number = Math.PI * 2;
    set endAngle(value: number) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.dirtyPath = true;
        }
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private get fullPie(): boolean {
        return isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
    }

    private _counterClockwise: boolean = false;
    set counterClockwise(value: boolean) {
        if (this._counterClockwise !== value) {
            this._counterClockwise = value;
            this.dirtyPath = true;
        }
    }
    get counterClockwise(): boolean {
        return this._counterClockwise;
    }

    /**
     * The type of arc to render:
     * - {@link ArcType.Open} - end points of the arc segment are not connected (default)
     * - {@link ArcType.Chord} - end points of the arc segment are connected by a line segment
     * - {@link ArcType.Round} - each of the end points of the arc segment are connected
     *                           to the center of the arc
     * Arcs with {@link ArcType.Open} do not support hit testing, even if they have their
     * {@link Shape.fillStyle} set, because they are not closed paths. Hit testing support
     * would require using two paths - one for rendering, another for hit testing - and there
     * doesn't seem to be a compelling reason to do that, when one can just use {@link ArcType.Chord}
     * to create a closed path.
     */
    private _type: ArcType = ArcType.Open;
    set type(value: ArcType) {
        if (this._type !== value) {
            this._type = value;
            this.dirtyPath = true;
        }
    }
    get type(): ArcType {
        return this._type;
    }

    updatePath(): void {
        if (!this.dirtyPath) {
            return;
        }

        const path = this.path;

        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, this.startAngle, this.endAngle, this.counterClockwise ? 1 : 0);

        if (this.type === ArcType.Chord) {
            path.closePath();
        } else if (this.type === ArcType.Round && !this.fullPie) {
            path.lineTo(this.centerX, this.centerY);
            path.closePath();
        }

        this.dirtyPath = false;
    }

    readonly getBBox = (): BBox => {
        // Only works with full arcs (circles) and untransformed ellipses.
        return new BBox(
            this.centerX - this.radiusX,
            this.centerY - this.radiusY,
            this.radiusX * 2,
            this.radiusY * 2
        );
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getBBox();

        return this.type !== ArcType.Open
            && bbox.containsPoint(point.x, point.y)
            && this.path.isPointInPath(point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.updatePath();
        this.scene!.appendPath(this.path);

        this.fillStroke(ctx);

        this.dirty = false;
    }
}
