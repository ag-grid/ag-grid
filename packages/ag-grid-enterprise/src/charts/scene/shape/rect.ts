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

    private effectiveStrokeWidth: number = Shape.defaultStyles.strokeWidth;
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
                this.effectiveStrokeWidth = value;
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

        const borderSizing = this.sizing === RectSizing.Border;

        const path = this.path;
        path.clear();

        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;
        let strokeWidth: number;

        if (borderSizing) {
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            strokeWidth = Math.min(this.strokeWidth, halfWidth, halfHeight);

            x = Math.min(x + strokeWidth / 2, x + halfWidth);
            y = Math.min(y + strokeWidth / 2, y + halfHeight);
            width = Math.max(width - strokeWidth, 0);
            height = Math.max(height - strokeWidth, 0);
        } else {
            strokeWidth = this.strokeWidth;
        }

        this.effectiveStrokeWidth = strokeWidth;

        if (this.crisp && !borderSizing) {
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

        this.dirtyPath = false;
    }

    readonly getBBox = () => {
        return new BBox(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

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

    protected fillStroke(ctx: CanvasRenderingContext2D) {
        if (!this.scene) {
            return;
        }

        const pixelRatio = this.scene.canvas.pixelRatio || 1;

        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.globalAlpha = this.opacity * this.fillOpacity;

            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            const fillShadow = this.fillShadow;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fill();
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0)';

        if (this.stroke && this.effectiveStrokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.globalAlpha = this.opacity * this.strokeOpacity;

            ctx.lineWidth = this.effectiveStrokeWidth;
            if (this.lineDash) {
                ctx.setLineDash(this.lineDash);
            }
            if (this.lineDashOffset) {
                ctx.lineDashOffset = this.lineDashOffset;
            }
            if (this.lineCap) {
                ctx.lineCap = this.lineCap;
            }
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }

            const strokeShadow = this.strokeShadow;
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke();
        }
    }
}
