import {Shape} from "./shape";
import {Path2D} from "../path2D";
import {isPointInBBox} from "../bbox";
import {pixelSnap as _pixelSnap} from "../../canvas/canvas";

// _pixelSnap(3) compiles to Object(_canvas_canvas__WEBPACK_IMPORTED_MODULE_3__["pixelSnap"])(3)
// This has some performance hit and is not nice for readability nor debugging.
// For example, it shows up as `pixelSnap` in the Sources tab, but can't
// be called from console like that.
// See https://github.com/webpack/webpack/issues/5600
// The suggested `concatenateModules: true` config made no difference.
const pixelSnap = _pixelSnap;

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

    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     * Animated rects may not look nice with this option enabled, for example
     * when a rect is translated by a sub-pixel value on each frame.
     */
    private _crisp: boolean = false;
    set crisp(value: boolean) {
        if (this._crisp !== value) {
            this._crisp = value;
            this.dirtyPath = true;
        }
    }
    get crisp(): boolean {
        return this._crisp;
    }

    set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            // Normally, when the `lineWidth` changes, we only need to repaint the rect
            // without updating the path. If the `isCrisp` is set to `true` however,
            // we need to update the path to make sure the new stroke aligns to
            // the pixel grid. This is the reason we override the `lineWidth` setter
            // and getter here.
            if (this.crisp) {
                this.dirtyPath = true;
            } else {
                this.dirty = true;
            }
        }
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    updatePath() {
        if (!this.dirtyPath)
            return;

        const path = this.path;
        const radius = this.radius;

        path.clear();

        if (!radius) {
            if (this.crisp) {
                path.rect(
                    Math.round(this.x) + pixelSnap(this.lineWidth),
                    Math.round(this.y) + pixelSnap(this.lineWidth),
                    Math.round(this.width) + Math.round(this.x % 1 + this.width % 1),
                    Math.round(this.height) + Math.round(this.y % 1 + this.height % 1)
                );
            } else {
                path.rect(this.x, this.y, this.width, this.height);
            }
        } else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path2D` class.
            throw "TODO";
        }

        this.dirtyPath = false;
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
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.applyContextAttributes(ctx);
        this.updatePath();
        this.scene!.appendPath(this.path);

        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth && this.strokeStyle) {
            ctx.stroke();
        }

        this.dirty = false;
    }
}
