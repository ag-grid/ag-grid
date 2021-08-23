import { Node } from "./node";
import { Path2D } from "./path2D";
import { BBox } from "./bbox";

/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
export class ClipRect extends Node {

    static className = 'ClipRect';

    protected isContainerNode: boolean = true;

    protected path = new Path2D();

    containsPoint(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        return point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height;
    }

    private _enabled: boolean = true;
    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.dirty = true;
        }
    }
    get enabled(): boolean {
        return this._enabled;
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

    computeBBox(): BBox {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.enabled) {
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

        // debug
        // this.computeBBox().render(ctx, {
        //     label: this.id,
        //     resetTransform: true,
        //     fillStyle: 'rgba(0, 0, 0, 0.5)'
        // });
    }
}
