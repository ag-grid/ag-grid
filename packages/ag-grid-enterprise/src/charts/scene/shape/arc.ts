import {Shape} from "./shape";
import {Path2D} from "../path2D";
import {BBox, isPointInBBox} from "../bbox";

/**
 * Elliptical arc node.
 */
export class Arc extends Shape {

    static create(centerX: number, centerY: number, radiusX: number, radiusY: number,
                startAngle: number, endAngle: number, anticlockwise = false): Arc {
        const arc = new Arc();

        arc.centerX = centerX;
        arc.centerY = centerY;
        arc.radiusX = radiusX;
        arc.radiusY = radiusY;
        arc.startAngle = startAngle;
        arc.endAngle = endAngle;
        arc.anticlockwise = anticlockwise;

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

    private _anticlockwise: boolean = false;
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

    private getPlainBBox(): BBox {
        return {
            x: this.centerX - this.radiusX,
            y: this.centerY - this.radiusY,
            width: this.radiusX * 2,
            height: this.radiusY * 2
        };
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getPlainBBox();

        return isPointInBBox(bbox, point.x, point.y)
            && this.path.isPointInPath(point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
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
