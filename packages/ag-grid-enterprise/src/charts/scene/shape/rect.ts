import { Shape } from "./shape";
import { Path2D } from "../path2D";
import { BBox } from "../bbox";

export enum RectSizing {
    Content,
    Border
}

export class Rect extends Shape {

    static className = 'Rect';

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

    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            // Normally, when the `lineWidth` changes, we only need to repaint the rect
            // without updating the path. If the `isCrisp` is set to `true` however,
            // we need to update the path to make sure the new stroke aligns to
            // the pixel grid. This is the reason we override the `lineWidth` setter
            // and getter here.
            if (this.crisp || this.sizing === RectSizing.Border) {
                this.dirtyPath = true;
            } else {
                this.dirty = true;
            }
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _sizing: RectSizing = RectSizing.Content;
    set sizing(value: RectSizing) {
        if (this._sizing !== value) {
            this._sizing = value;
            this.dirtyPath = true;
        }
    }
    get sizing(): RectSizing {
        return this._sizing;
    }

    updatePath() {
        if (!this.dirtyPath) {
            return;
        }

        const path = this.path;
        const radius = this.radius;
        const strokeWidth = this.strokeWidth;

        path.clear();

        if (!radius) {
            let x = this.x;
            let y = this.y;
            let width = this.width;
            let height = this.height;

            if (this.sizing === RectSizing.Border) {
                x += strokeWidth / 2;
                y += strokeWidth / 2;
                x = Math.min(x, x + width / 2);
                y = Math.min(y, y + height / 2);
                width -= strokeWidth;
                height -= strokeWidth;
                width = Math.max(0.001, width);
                height = Math.max(0.001, height);
            }

            if (this.crisp) {
                const alignment = Math.floor(strokeWidth) % 2 / 2;
                path.rect(
                    Math.floor(x) + alignment,
                    Math.floor(y) + alignment,
                    Math.floor(width) + Math.floor(x % 1 + width % 1),
                    Math.floor(height) + Math.floor(y % 1 + height % 1)
                );
            } else {
                path.rect(x, y, width, height);
            }
        } else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path2D` class.
            throw "TODO";
        }

        this.dirtyPath = false;
    }

    readonly getBBox = () => {
        return new BBox(
            this.x,
            this.y,
            this.width,
            this.height
        );
    };

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getBBox();

        return bbox.containsPoint(point.x, point.y);
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
