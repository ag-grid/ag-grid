import {Shape} from "./shape";
import {chainObjects} from "../../util/object";
import {Path} from "../path";

/**
 * Elliptical arc node.
 */
export class Arc extends Shape {

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        fillStyle: 'red',
        strokeStyle: 'black'
    });

    constructor(centerX: number, centerY: number, radiusX: number, radiusY: number,
                startAngle: number, endAngle: number, anticlockwise = false) {
        super();

        this._centerX = centerX;
        this._centerY = centerY;
        this._radiusX = radiusX;
        this._radiusY = radiusY;
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._anticlockwise = anticlockwise;

        this.fillStyle = Arc.defaultStyles.fillStyle;
        this.strokeStyle = Arc.defaultStyles.strokeStyle;
    }

    // Declare a path to retain for later rendering and hit testing
    // using custom Path class. It's pure TypeScript and works in all browsers.
    protected path = new Path();

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

    private _centerX: number;
    set centerX(value: number) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.dirtyPath = true;
        }
    }
    get centerX(): number {
        return this._centerX;
    }

    private _centerY: number;
    set centerY(value: number) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.dirtyPath = true;
        }
    }
    get centerY(): number {
        return this._centerY;
    }

    private _radiusX: number;
    set radiusX(value: number) {
        if (this._radiusX !== value) {
            this._radiusX = value;
            this.dirtyPath = true;
        }
    }
    get radiusX(): number {
        return this._radiusX;
    }

    private _radiusY: number;
    set radiusY(value: number) {
        if (this._radiusY !== value) {
            this._radiusY = value;
            this.dirtyPath = true;
        }
    }
    get radiusY(): number {
        return this._radiusY;
    }

    private _startAngle: number;
    set startAngle(value: number) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.dirtyPath = true;
        }
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number;
    set endAngle(value: number) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.dirtyPath = true;
        }
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private _anticlockwise: boolean;
    set anticlockwise(value: boolean) {
        if (this._anticlockwise !== value) {
            this._anticlockwise = value;
            this.dirtyPath = true;
        }
    }
    get anticlockwise(): boolean {
        return this._anticlockwise;
    }

    updatePath() {
        if (!this.dirtyPath)
            return;

        const path = this.path;

        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, this.startAngle, this.endAngle, this.anticlockwise ? 1 : 0);
        path.closePath();

        this.dirtyPath = false;
    }

    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        // TODO: implement hit testing in the Path class.
        // For example:
        // return this.path.isPointInPath(x, y);
        return false;
    }

    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.scene) {
            return;
        }

        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.applyContextAttributes(ctx);
        this.updatePath();
        this.scene.appendPath(this.path);

        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.strokeStyle) {
            ctx.stroke();
        }

        this.dirty = false;
    }
}
