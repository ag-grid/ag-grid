import { Node } from "./node";
import { Path2D } from "./path2D";

/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
export class ClipRect extends Node {

    static className = 'ClipRect';

    protected isContainerNode: boolean = true;

    protected path = new Path2D();

    isPointInNode(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        return point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height;
    }

    private _active: boolean = true;
    set active(value: boolean) {
        if (this._active !== value) {
            this._active = value;
            this.dirty = true;
        }
    }
    get active(): boolean {
        return this._active;
    }

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

    updatePath() {
        const path = this.path;

        path.clear();
        path.rect(this.x, this.y, this.width, this.height);

        this.dirtyPath = false;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.active) {
            if (this.dirtyPath) {
                this.updatePath();
            }
            this.scene!.appendPath(this.path);
            ctx.clip();
        }

        const children = this.children;
        const n = children.length;

        for (let i = 0; i < n; i++) {
            ctx.save();
            const child = children[i];
            if (child.visible) {
                child.render(ctx);
            }
            ctx.restore();
        }
    }
}
