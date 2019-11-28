import { Shape } from "./shape";
import { isEqual } from "../../util/number";
import { normalizeAngle360 } from "../../util/angle";

export enum ArcType {
    Open,
    Chord,
    Round
}

/**
 * Circular arc node that uses the experimental `Path2D` class to define
 * the arc path for further rendering and hit-testing.
 */
export class Arc extends Shape {

    static className = 'Arc';

    // Declare a path to feed to `context.fill/stroke` using experimental native Path2D class.
    // Doesn't work in IE.
    protected path = new Path2D();

    /**
     * It's not always that the path has to be updated.
     * For example, if transform attributes (such as `translationX`)
     * are changed, we don't have to update the path. The `dirtyFlag`
     * is how we keep track if the path has to be updated or not.
     */
    private _dirtyPath: boolean = true;
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

    private _radius: number = 10;
    set radius(value: number) {
        if (this._radius !== value) {
            this._radius = value;
            this.dirtyPath = true;
        }
    }
    get radius(): number {
        return this._radius;
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

    updatePath() {
        if (!this.dirtyPath) {
            return;
        }

        // No way to clear existing Path2D, have to create a new one each time.
        const path = this.path = new Path2D();

        path.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
        if (this.type === ArcType.Chord) {
            path.closePath();
        } else if (this.type === ArcType.Round && !this.fullPie) {
            path.lineTo(this.x, this.y);
            path.closePath();
        }

        this.dirtyPath = false;
    }

    // Native Path2D's isPointInPath/isPointInStroke require multiplying by the pixelRatio:
    // const x = mouseEvent.offsetX * pixelRatio;
    // const y = mouseEvent.offsetY * pixelRatio;
    isPointInPath(x: number, y: number): boolean {
        return false; //ctx.isPointInPath(this.path, x, y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false; //ctx.isPointInStroke(this.path, x, y);
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.scene) {
            return;
        }

        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.updatePath();

        if (this.opacity < 1) {
            ctx.globalAlpha = this.opacity;
        }

        const pixelRatio = this.scene.canvas.pixelRatio || 1;

        if (this.fill) {
            ctx.fillStyle = this.fill;

            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            const fillShadow = this.fillShadow;
            if (fillShadow) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fill(this.path);
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0)';

        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.lineWidth = this.strokeWidth;
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
            if (strokeShadow) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke(this.path);
        }

        // About 15% performance loss for re-creating and retaining a Path2D
        // object for hit testing.

        this.dirty = false;
    }
}
