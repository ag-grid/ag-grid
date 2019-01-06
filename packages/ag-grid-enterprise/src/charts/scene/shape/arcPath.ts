import {Shape} from "./shape";
import {chainObjects} from "../../util/object";
import {Path} from "../path";

export class Arc extends Shape {

    protected static defaults = chainObjects(Shape.defaults, {
        fillStyle: 'red',
        strokeStyle: 'black',

        x: 0,
        y: 0,
        radius: 10,
        startAngle: 0,
        endAngle: Math.PI * 2,
        anticlockwise: false
    });

    constructor() {
        super();
        this.fillStyle = Arc.defaults.fillStyle;
        this.strokeStyle = Arc.defaults.strokeStyle;
    }

    // Declare a path to retain for later rendering and hit testing
    // using custom Path class. It's pure TypeScript and works in all browsers.
    protected path = new Path();

    private _x: number = Arc.defaults.x;
    set x(value: number) {
        this._x = value;
        this.dirty = true;
    }
    get x(): number {
        return this._x;
    }

    private _y: number = Arc.defaults.y;
    set y(value: number) {
        this._y = value;
        this.dirty = true;
    }
    get y(): number {
        return this._y;
    }

    private _radius: number = Arc.defaults.radius;
    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
    }
    get radius(): number {
        return this._radius;
    }

    private _startAngle: number = Arc.defaults.startAngle;
    set startAngle(value: number) {
        this._startAngle = value;
        this.dirty = true;
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number = Arc.defaults.endAngle;
    set endAngle(value: number) {
        this._endAngle = value;
        this.dirty = true;
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private _anticlockwise: boolean = Arc.defaults.anticlockwise;
    set anticlockwise(value: boolean) {
        this._anticlockwise = value;
        this.dirty = true;
    }
    get anticlockwise(): boolean {
        return this._anticlockwise;
    }

    updatePath() {
        const path = this.path;

        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.x, this.y, this.radius, this.radius, 0, this.startAngle, this.endAngle, this.anticlockwise ? 1 : 0);
        path.closePath();
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
        if (this.scene) {
            this.updatePath();
            this.applyContextAttributes(ctx);
            this.scene.appendPath(this.path);
            ctx.fill();
            ctx.stroke();
        }

        this.dirty = false;
    }
}
