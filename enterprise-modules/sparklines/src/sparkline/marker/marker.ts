import { Shape } from '../../scene/shape/shape';

export abstract class Marker extends Shape {
    protected _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x(): number {
        return this._x;
    }

    protected _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.dirty = true;
        }
    }
    get y(): number {
        return this._y;
    }

    protected _size: number = 3;
    set size(value: number) {
        if (this._size !== value) {
            this._size = value;
            this.dirty = true;
        }
    }
    get size(): number {
        return this._size;
    }
}