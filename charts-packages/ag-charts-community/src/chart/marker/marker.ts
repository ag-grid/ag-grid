import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";

export abstract class Marker extends Path {
    protected _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirtyPath = true;
        }
    }
    get x(): number {
        return this._x;
    }

    protected _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.dirtyPath = true;
        }
    }
    get y(): number {
        return this._y;
    }

    protected _size: number = 12;
    set size(value: number) {
        if (this._size !== value) {
            this._size = Math.abs(value);
            this.dirtyPath = true;
        }
    }
    get size(): number {
        return this._size;
    }

    computeBBox(): BBox {
        const { x, y, size } = this;
        const half = size / 2;

        return new BBox(x - half, y - half, size, size);
    }
}
