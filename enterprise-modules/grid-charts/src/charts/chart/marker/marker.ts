import { Path } from "../../scene/shape/path";

export abstract class Marker extends Path {
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

    private _size: number = 4;
    set size(value: number) {
        if (this._size !== value) {
            this._size = Math.abs(value);
            this.dirtyPath = true;
        }
    }
    get size(): number {
        return this._size;
    }
}