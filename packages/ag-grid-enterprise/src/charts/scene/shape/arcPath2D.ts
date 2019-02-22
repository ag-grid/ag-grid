import {Shape} from "./shape";
import {chainObjects} from "../../util/object";

/**
 * Circular arc node that uses the experimental `Path2D` class to define
 * the arc path for further rendering and hit-testing.
 */
export class Arc extends Shape {
    // Declare a path to feed to `context.fill/stroke` using experimental native Path2D class.
    // Doesn't work in IE.
    protected path = new Path2D();

    private _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.isDirty = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.isDirty = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private _radius: number = 10;
    set radius(value: number) {
        if (this._radius !== value) {
            this._radius = value;
            this.isDirty = true;
        }
    }
    get radius(): number {
        return this._radius;
    }

    private _startAngle: number = 0;
    set startAngle(value: number) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.isDirty = true;
        }
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number = Math.PI * 2;
    set endAngle(value: number) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.isDirty = true;
        }
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private _isCounterClockwise: boolean = false;
    set isCounterClockwise(value: boolean) {
        if (this._isCounterClockwise !== value) {
            this._isCounterClockwise = value;
            this.isDirty = true;
        }
    }
    get isCounterClockwise(): boolean {
        return this._isCounterClockwise;
    }

    updatePath() {
        this.path = new Path2D();
        // No way to clear existing Path2D, have to create a new one each time.
        this.path.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.isCounterClockwise);
        this.path.closePath();
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
        // Path2D approach:
        this.updatePath();
        this.applyContextAttributes(ctx);
        ctx.fill(this.path);
        ctx.stroke(this.path);

        // Traditional approach:
        // this.applyContextAttributes(ctx);
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        // ctx.fill();
        // ctx.stroke();

        // About 15% performance loss for re-creating and retaining a Path2D
        // object for hit testing.

        this.isDirty = false;
    }
}
