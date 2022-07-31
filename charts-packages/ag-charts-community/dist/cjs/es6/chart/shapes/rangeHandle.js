"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("../../scene/shape/path");
const bbox_1 = require("../../scene/bbox");
class RangeHandle extends path_1.Path {
    constructor() {
        super(...arguments);
        this._fill = '#f2f2f2';
        this._stroke = '#999999';
        this._strokeWidth = 1;
        this._lineCap = 'square';
        this._centerX = 0;
        this._centerY = 0;
        // Use an even number for better looking results.
        this._width = 8;
        // Use an even number for better looking results.
        this._gripLineGap = 2;
        // Use an even number for better looking results.
        this._gripLineLength = 8;
        this._height = 16;
    }
    set centerX(value) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.dirtyPath = true;
        }
    }
    get centerX() {
        return this._centerX;
    }
    set centerY(value) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.dirtyPath = true;
        }
    }
    get centerY() {
        return this._centerY;
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
    set gripLineGap(value) {
        if (this._gripLineGap !== value) {
            this._gripLineGap = value;
            this.dirtyPath = true;
        }
    }
    get gripLineGap() {
        return this._gripLineGap;
    }
    set gripLineLength(value) {
        if (this._gripLineLength !== value) {
            this._gripLineLength = value;
            this.dirtyPath = true;
        }
    }
    get gripLineLength() {
        return this._gripLineLength;
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
    computeBBox() {
        const { centerX, centerY, width, height } = this;
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        return new bbox_1.BBox(x, y, width, height);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return bbox.containsPoint(point.x, point.y);
    }
    updatePath() {
        const { path, centerX, centerY, width, height } = this;
        path.clear();
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        const ax = this.align(x);
        const ay = this.align(y);
        const axw = ax + this.align(x, width);
        const ayh = ay + this.align(y, height);
        // Handle.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        // Grip lines.
        const dx = this.gripLineGap / 2;
        const dy = this.gripLineLength / 2;
        path.moveTo(this.align(centerX - dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX - dx), this.align(centerY + dy));
        path.moveTo(this.align(centerX + dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX + dx), this.align(centerY + dy));
    }
}
exports.RangeHandle = RangeHandle;
RangeHandle.className = 'RangeHandle';
