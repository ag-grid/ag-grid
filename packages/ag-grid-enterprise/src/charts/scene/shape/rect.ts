import {Shape} from "./shape";
import {Path2D} from "../path2D";
import {BBox, isPointInBBox} from "../bbox";

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

    private _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirtyPath = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.dirtyPath = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private _width: number = 10;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.dirtyPath = true;
        }
    }
    get width(): number {
        return this._width;
    }

    private _height: number = 10;
    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.dirtyPath = true;
        }
    }
    get height(): number {
        return this._height;
    }

    private _radius: number = 0;
    set radius(value: number) {
        if (this._radius !== value) {
            this._radius = value;
            this.dirtyPath = true;
        }
    }
    get radius(): number {
        return this._radius;
    }

    updatePath() {
        if (!this.dirtyPath)
            return;

        const path = this.path;
        const radius = this.radius;

        path.clear();

        if (!radius) {
            path.rect(this.x, this.y, this.width, this.height);
        } else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path2D` class.
            throw "TODO";
        }
    }

    private getPlainBBox(): BBox {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getPlainBBox();

        return isPointInBBox(bbox, point.x, point.y);
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
