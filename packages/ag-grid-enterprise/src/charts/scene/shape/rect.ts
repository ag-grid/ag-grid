import { Shape } from "./shape";
import { Path } from "../path";
import {chainObjects} from "../../util/object";

export class Rect extends Shape {

    protected static defaults = chainObjects(Shape.defaults, {
        fillStyle: 'red',
        strokeStyle: 'black',

        x: 0,
        y: 0,
        width: 10,
        height: 10,
        radius: 0
    });

    constructor() {
        super();

        // Override the base class defaults.
        this.fillStyle = Rect.defaults.fillStyle;
        this.strokeStyle = Rect.defaults.strokeStyle;
        // Alternatively we can do:
        // this.restoreOverriddenDefaults();
        // This call can even happen in the base class constructor,
        // so that we don't worry about forgetting calling it in subclasses.
        // This will figure out the properties (above) to apply
        // automatically, but makes construction more expensive.
        // TODO: measure the performance impact.
    }

    protected path = new Path();

    _x: number = Rect.defaults.x;
    set x(value: number) {
        this._x = value;
        this.dirty = true;
    }
    get x(): number {
        return this._x;
    }

    _y: number = Rect.defaults.y;
    set y(value: number) {
        this._y = value;
        this.dirty = true;
    }
    get y(): number {
        return this._y;
    }

    _width: number = Rect.defaults.width;
    set width(value: number) {
        this._width = value;
        this.dirty = true;
    }
    get width(): number {
        return this._width;
    }

    _height: number = Rect.defaults.height;
    set height(value: number) {
        this._height = value;
        this.dirty = true;
    }
    get height(): number {
        return this._height;
    }

    _radius: number = Rect.defaults.radius;
    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
    }
    get radius(): number {
        return this._radius;
    }

    updatePath() {
        const path = this.path;
        const radius = this.radius;

        path.clear();

        if (!radius) {
            path.rect(this.x, this.y, this.width, this.height);
        } else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path` class.
            throw "TODO";
        }
    }

    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
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
