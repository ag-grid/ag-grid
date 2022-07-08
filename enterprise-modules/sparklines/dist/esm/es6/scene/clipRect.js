import { Node } from "./node";
import { Path2D } from "./path2D";
import { BBox } from "./bbox";
/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
export class ClipRect extends Node {
    constructor() {
        super(...arguments);
        this.isContainerNode = true;
        this.path = new Path2D();
        this._enabled = true;
        this._dirtyPath = true;
        this._x = 0;
        this._y = 0;
        this._width = 10;
        this._height = 10;
    }
    containsPoint(x, y) {
        const point = this.transformPoint(x, y);
        return point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height;
    }
    set enabled(value) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.dirty = true;
        }
    }
    get enabled() {
        return this._enabled;
    }
    set dirtyPath(value) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyPath() {
        return this._dirtyPath;
    }
    set x(value) {
        if (this._x !== value) {
            this._x = value;
            this.dirtyPath = true;
        }
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y !== value) {
            this._y = value;
            this.dirtyPath = true;
        }
    }
    get y() {
        return this._y;
    }
    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.dirtyPath = true;
        }
    }
    get width() {
        return this._width;
    }
    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.dirtyPath = true;
        }
    }
    get height() {
        return this._height;
    }
    updatePath() {
        const path = this.path;
        path.clear();
        path.rect(this.x, this.y, this.width, this.height);
        this.dirtyPath = false;
    }
    computeBBox() {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }
    render(ctx) {
        if (this.enabled) {
            if (this.dirtyPath) {
                this.updatePath();
            }
            this.scene.appendPath(this.path);
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
ClipRect.className = 'ClipRect';
