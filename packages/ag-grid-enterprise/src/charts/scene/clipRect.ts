import {Node} from "./node";
import {Path2D} from "./path2D";

export class ClipRect extends Node {

    protected path = new Path2D();

    isPointInNode(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        return point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height;
    }

    private _isActive: boolean = true;
    set isActive(value: boolean) {
        if (this._isActive !== value) {
            this._isActive = value;
            this.isDirty = true;
        }
    }
    get isActive(): boolean {
        return this._isActive;
    }

    private _isDirtyPath = true;
    set isDirtyPath(value: boolean) {
        if (this._isDirtyPath !== value) {
            this._isDirtyPath = value;
            if (value) {
                this.isDirty = true;
            }
        }
    }
    get isDirtyPath(): boolean {
        return this._isDirtyPath;
    }

    private _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.isDirtyPath = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.isDirtyPath = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private _width: number = 10;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.isDirtyPath = true;
        }
    }
    get width(): number {
        return this._width;
    }

    private _height: number = 10;
    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.isDirtyPath = true;
        }
    }
    get height(): number {
        return this._height;
    }

    updatePath() {
        if (!this.isDirtyPath) {
            return;
        }

        const path = this.path;

        path.clear();
        path.rect(this.x, this.y, this.width, this.height);

        this.isDirtyPath = false;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.isActive) {
            this.updatePath();
            this.scene!.appendPath(this.path);
            ctx.clip();
        }

        const children = this.children;
        const n = children.length;

        for (let i = 0; i < n; i++) {
            ctx.save();
            const child = children[i];
            if (child.isVisible) {
                child.render(ctx);
            }
            ctx.restore();
        }
    }
}
