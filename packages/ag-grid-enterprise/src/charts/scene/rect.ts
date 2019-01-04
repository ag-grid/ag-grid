import { Node } from "./node";
import { Path } from "./path";

export class Rect extends Node {

    _hitTestable = true;
    set hitTestable(value: boolean) {
        this._hitTestable = value;
    }
    get hitTestable(): boolean {
        return this._hitTestable;
    }

    protected path = new Path();

    _x: number = 0;
    set x(value: number) {
        this._x = value;
        this.dirty = true;
    }
    get x(): number {
        return this._x;
    }

    _y: number = 0;
    set y(value: number) {
        this._y = value;
        this.dirty = true;
    }
    get y(): number {
        return this._y;
    }

    _width: number = 10;
    set width(value: number) {
        this._width = value;
        this.dirty = true;
    }
    get width(): number {
        return this._width;
    }

    _height: number = 10;
    set height(value: number) {
        this._height = value;
        this.dirty = true;
    }
    get height(): number {
        return this._height;
    }

    updatePath() {
        // if (!this.path) {
        //     this.path = new Path();
        // }
        const path = this.path;
        path.clear();
        // path.cubicArc(this.x, this.y, 5, 5, 0, 0, Math.PI * 2, 0);
        path.moveTo(this.x, this.y);
        path.lineTo(this.x + this.width, this.y);
        path.lineTo(this.x + this.width, this.y + this.height);
        path.lineTo(this.x, this.y + this.height);
        path.closePath();
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.hitTestable) {
            this.updatePath();
            if (this.scene) {
                this.scene.appendPath(this.path);
            }
        }
        else {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
        }

        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'black';
        ctx.fill();
        ctx.stroke();

        this.dirty = false;
    }
}
