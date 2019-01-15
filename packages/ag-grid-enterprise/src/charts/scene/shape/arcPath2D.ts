import {Shape} from "./shape";
import {chainObjects} from "../../util/object";

/**
 * Circular arc node that uses the experimental `Path2D` class to define
 * the arc path for further rendering and hit-testing.
 */
export class Arc extends Shape {

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        fillStyle: 'red',
        strokeStyle: 'black'
    });

    constructor(x: number, y: number, radius: number,
                startAngle: number, endAngle: number, anticlockwise = false) {
        super();

        this._x = x;
        this._y = y;
        this._radius = radius;
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._anticlockwise = anticlockwise;

        this.fillStyle = Arc.defaultStyles.fillStyle;
        this.strokeStyle = Arc.defaultStyles.strokeStyle;
    }

    // Declare a path to feed to `context.fill/stroke` using experimental native Path2D class.
    // Doesn't work in IE.
    protected path = new Path2D();

    private _x: number;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.dirty = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private _radius: number;
    set radius(value: number) {
        if (this._radius !== value) {
            this._radius = value;
            this.dirty = true;
        }
    }
    get radius(): number {
        return this._radius;
    }

    private _startAngle: number;
    set startAngle(value: number) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.dirty = true;
        }
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number;
    set endAngle(value: number) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.dirty = true;
        }
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private _anticlockwise: boolean;
    set anticlockwise(value: boolean) {
        if (this._anticlockwise !== value) {
            this._anticlockwise = value;
            this.dirty = true;
        }
    }
    get anticlockwise(): boolean {
        return this._anticlockwise;
    }

    updatePath() {
        this.path = new Path2D();
        // No way to clear existing Path2D, have to create a new one each time.
        this.path.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        this.path.closePath();
    }

    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return ctx.isPointInPath(this.path, x, y);
    }

    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return ctx.isPointInStroke(this.path, x, y);
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

        this.dirty = false;
    }
}
