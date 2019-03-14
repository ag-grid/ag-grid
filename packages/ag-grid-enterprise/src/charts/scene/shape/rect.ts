import {Shape} from "./shape";
import {Path2D} from "../path2D";
import {isPointInBBox} from "../bbox";
import {pixelSnap} from "../../canvas/canvas";

export class Rect extends Shape {

    static create(x: number, y: number, width: number, height: number, radius = 0): Rect {
        const rect = new Rect();

        rect.x = x;
        rect.y = y;
        rect.width = width;
        rect.height = height;
        rect.radius = radius;

        return rect;
    }

    protected path = new Path2D();

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

    private _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.isDirtyPath = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.isDirtyPath = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private _width: number = 10;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.isDirtyPath = true;
        }
    }
    get width(): number {
        return this._width;
    }

    private _height: number = 10;
    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.isDirtyPath = true;
        }
    }
    get height(): number {
        return this._height;
    }

    private _radius: number = 0;
    set radius(value: number) {
        if (this._radius !== value) {
            this._radius = value;
            this.isDirtyPath = true;
        }
    }
    get radius(): number {
        return this._radius;
    }

    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     * Animated rects may not look nice with this option enabled, for example
     * when a rect is translated by a sub-pixel value on each frame.
     */
    private _isCrisp: boolean = false;
    set isCrisp(value: boolean) {
        if (this._isCrisp !== value) {
            this._isCrisp = value;
            this.isDirtyPath = true;
        }
    }
    get isCrisp(): boolean {
        return this._isCrisp;
    }

    updatePath() {
        if (!this.isDirtyPath)
            return;

        const path = this.path;
        const radius = this.radius;

        path.clear();

        if (!radius) {
            if (this.isCrisp) {
                path.rect(
                    Math.round(this.x) + pixelSnap(this.lineWidth),
                    Math.round(this.y) + pixelSnap(this.lineWidth),
                    Math.round(this.width),
                    Math.round(this.height)
                );
            } else {
                path.rect(this.x, this.y, this.width, this.height);
            }
        } else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path2D` class.
            throw "TODO";
        }

        this.isDirtyPath = false;
    }

    readonly getBBox = () => {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    };

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getBBox();

        return isPointInBBox(bbox, point.x, point.y);
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
