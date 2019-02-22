import {Shape} from "./shape";
import {Path2D} from "../path2D";
import {BBox, isPointInBBox} from "../bbox";
import {normalizeAngle360} from "../../util/angle";
import {chainObjects} from "../../util/object";

export enum ArcType {
    Open,
    Chord,
    Round
}

/**
 * Elliptical arc node.
 */
export class Arc extends Shape {

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        strokeStyle: 'black',
        fillStyle: null
    });

    constructor() {
        super();
        this.restoreOwnStyles();
    }

    static create(centerX: number, centerY: number, radiusX: number, radiusY: number = radiusX,
                  startAngle: number = 0, endAngle: number = Math.PI * 2, isCounterClockwise = false): Arc {
        const arc = new Arc();

        arc.centerX = centerX;
        arc.centerY = centerY;
        arc.radiusX = radiusX;
        arc.radiusY = radiusY;
        arc.startAngle = startAngle;
        arc.endAngle = endAngle;
        arc.isCounterClockwise = isCounterClockwise;

        return arc;
    }

    // Declare a path to retain for later rendering and hit testing
    // using custom Path2D class. It's pure TypeScript and works in all browsers.
    protected path = new Path2D();

    /**
     * It's not always that the path has to be updated.
     * For example, if transform attributes (such as `translationX`)
     * are changed, we don't have to update the path. The `dirtyFlag`
     * is how we keep track if the path has to be updated or not.
     */
    private _isDirtyPath = true;
    set isDirtyPath(value: boolean) {
        if (this._isDirtyPath !== value) {
            this._isDirtyPath = value;
            if (value) {
                this.isDirty = true;
            }
        }
    }
    get isDirtyPath(): boolean {
        return this._isDirtyPath;
    }

    private _centerX: number = 0;
    set centerX(value: number) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.isDirtyPath = true;
        }
    }
    get centerX(): number {
        return this._centerX;
    }

    private _centerY: number = 0;
    set centerY(value: number) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.isDirtyPath = true;
        }
    }
    get centerY(): number {
        return this._centerY;
    }

    private _radiusX: number = 10;
    set radiusX(value: number) {
        if (this._radiusX !== value) {
            this._radiusX = value;
            this.isDirtyPath = true;
        }
    }
    get radiusX(): number {
        return this._radiusX;
    }

    private _radiusY: number = 10;
    set radiusY(value: number) {
        if (this._radiusY !== value) {
            this._radiusY = value;
            this.isDirtyPath = true;
        }
    }
    get radiusY(): number {
        return this._radiusY;
    }

    private _startAngle: number = 0;
    set startAngle(value: number) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.isDirtyPath = true;
        }
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number = Math.PI * 2;
    set endAngle(value: number) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.isDirtyPath = true;
        }
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private get isFullPie(): boolean {
        return normalizeAngle360(this.startAngle) === normalizeAngle360(this.endAngle);
    }

    private _isCounterClockwise: boolean = false;
    set isCounterClockwise(value: boolean) {
        if (this._isCounterClockwise !== value) {
            this._isCounterClockwise = value;
            this.isDirtyPath = true;
        }
    }
    get isCounterClockwise(): boolean {
        return this._isCounterClockwise;
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
            this.isDirtyPath = true;
        }
    }
    get type(): ArcType {
        return this._type;
    }

    updatePath(): void {
        if (!this.isDirtyPath)
            return;

        const path = this.path;

        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, this.startAngle, this.endAngle, this.isCounterClockwise ? 1 : 0);

        if (this.type === ArcType.Chord) {
            path.closePath();
        } else if (this.type === ArcType.Round && !this.isFullPie) {
            path.lineTo(this.centerX, this.centerY);
            path.closePath();
        }

        this.isDirtyPath = false;
    }

    readonly getBBox = (): BBox => {
        return {
            x: this.centerX - this.radiusX,
            y: this.centerY - this.radiusY,
            width: this.radiusX * 2,
            height: this.radiusY * 2
        };
    };

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getBBox();

        return this.type !== ArcType.Open
            && isPointInBBox(bbox, point.x, point.y)
            && this.path.isPointInPath(point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.isDirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.applyContextAttributes(ctx);
        this.updatePath();
        this.scene!.appendPath(this.path);

        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.strokeStyle) {
            ctx.stroke();
        }

        this.isDirty = false;
    }
}
