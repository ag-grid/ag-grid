"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("../../scene/shape/shape");
class Rectangle extends shape_1.Shape {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        /**
         * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
         */
        this._crisp = false;
    }
    set x(value) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y !== value) {
            this._y = value;
            this.dirty = true;
        }
    }
    get y() {
        return this._y;
    }
    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.dirty = true;
        }
    }
    get width() {
        return this._width;
    }
    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.dirty = true;
        }
    }
    get height() {
        return this._height;
    }
    set crisp(value) {
        if (this._crisp !== value) {
            this._crisp = value;
            this.dirty = true;
        }
    }
    get crisp() {
        return this._crisp;
    }
    isPointInStroke(x, y) {
        return false;
    }
    isPointInPath(x, y) {
        return false;
    }
    render(ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        const { x, y, width, height, crisp } = this;
        ctx.beginPath();
        if (crisp) {
            // ensure stroke aligns to the pixel grid
            const { alignment: a, align: al } = this;
            ctx.rect(al(a, x), al(a, y), al(a, x, width), al(a, y, height));
        }
        else {
            ctx.rect(x, y, width, height);
        }
        this.fillStroke(ctx);
        this.dirty = false;
    }
}
exports.Rectangle = Rectangle;
Rectangle.className = 'Column';
