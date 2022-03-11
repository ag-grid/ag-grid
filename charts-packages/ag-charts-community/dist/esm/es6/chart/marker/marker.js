import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
export class Marker extends Path {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this._size = 12;
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
    set size(value) {
        if (this._size !== value) {
            this._size = Math.abs(value);
            this.dirtyPath = true;
        }
    }
    get size() {
        return this._size;
    }
    computeBBox() {
        const { x, y, size } = this;
        const half = size / 2;
        return new BBox(x - half, y - half, size, size);
    }
}
//# sourceMappingURL=marker.js.map