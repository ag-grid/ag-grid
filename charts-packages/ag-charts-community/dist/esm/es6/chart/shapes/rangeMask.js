import { Path } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
export class RangeMask extends Path {
    constructor() {
        super(...arguments);
        this._stroke = '#999999';
        this._strokeWidth = 1;
        this._fill = '#999999';
        this._fillOpacity = 0.2;
        this._lineCap = 'square';
        this._x = 0;
        this._y = 0;
        this._width = 200;
        this._height = 30;
        this.minRange = 0.05;
        this._min = 0;
        this._max = 1;
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
    set min(value) {
        value = Math.min(Math.max(value, 0), this.max - this.minRange);
        if (isNaN(value)) {
            return;
        }
        if (this._min !== value) {
            this._min = value;
            this.dirtyPath = true;
            this.onRangeChange && this.onRangeChange(value, this.max);
        }
    }
    get min() {
        return this._min;
    }
    set max(value) {
        value = Math.max(Math.min(value, 1), this.min + this.minRange);
        if (isNaN(value)) {
            return;
        }
        if (this._max !== value) {
            this._max = value;
            this.dirtyPath = true;
            this.onRangeChange && this.onRangeChange(this.min, value);
        }
    }
    get max() {
        return this._max;
    }
    computeBBox() {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }
    computeVisibleRangeBBox() {
        const { x, y, width, height, min, max } = this;
        const minX = x + width * min;
        const maxX = x + width * max;
        return new BBox(minX, y, maxX - minX, height);
    }
    updatePath() {
        const { path, x, y, width, height, min, max } = this;
        path.clear();
        const ax = this.align(x);
        const ay = this.align(y);
        const axw = ax + this.align(x, width);
        const ayh = ay + this.align(y, height);
        // Whole range.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        const minX = this.align(x + width * min);
        const maxX = this.align(x + width * max);
        // Visible range.
        path.moveTo(minX, ay);
        path.lineTo(minX, ayh);
        path.lineTo(maxX, ayh);
        path.lineTo(maxX, ay);
        path.lineTo(minX, ay);
    }
}
RangeMask.className = 'RangeMask';
