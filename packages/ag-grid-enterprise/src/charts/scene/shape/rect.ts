import { Shape } from "./shape";
import { Path } from "../path";
import { Matrix } from "../matrix";
import {chainObjects} from "../../util/object";

export class Rect extends Shape {

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        fillStyle: 'red',
        strokeStyle: 'black'
    });

    constructor(x: number, y: number, width: number, height: number, radius = 0) {
        super();

        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._radius = radius;

        // Override the base class default styles.
        this.fillStyle = Rect.defaultStyles.fillStyle;
        this.strokeStyle = Rect.defaultStyles.strokeStyle;
        // Alternatively we can do:
        // this.restoreOverriddenDefaults();
        // This call can even happen in the base class constructor,
        // so that we don't worry about forgetting calling it in subclasses.
        // This will figure out the properties (above) to apply
        // automatically, but makes construction more expensive.
        // TODO: measure the performance impact.
    }

    protected path = new Path();

    /**
     * TODO: create a common base class for all nodes that use the `Path`?
     *       At least those that need a single path/fill/stroke,
     *       which is likely all we'll ever need.
     */
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

    private _x: number;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirtyPath = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.dirtyPath = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private _width: number;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.dirtyPath = true;
        }
    }
    get width(): number {
        return this._width;
    }

    private _height: number;
    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.dirtyPath = true;
        }
    }
    get height(): number {
        return this._height;
    }

    private _radius: number;
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
        if (!this.scene) {
            return;
        }

        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        // const matrix = Matrix.flyweight();
        // let parent = this.parent;
        // while (parent) {
        //     matrix.preMultiplySelf(parent.matrix);
        //     parent = parent.parent;
        // }
        // matrix.toContext(ctx);

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
