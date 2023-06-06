var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
import { LINE_CAP, NUMBER, COLOR_STRING, Validate } from '../../util/validation';
export class RangeHandle extends Path {
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
        return new BBox(x, y, width, height);
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
RangeHandle.className = 'RangeHandle';
__decorate([
    Validate(COLOR_STRING)
], RangeHandle.prototype, "_fill", void 0);
__decorate([
    Validate(COLOR_STRING)
], RangeHandle.prototype, "_stroke", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_strokeWidth", void 0);
__decorate([
    Validate(LINE_CAP)
], RangeHandle.prototype, "_lineCap", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_width", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_gripLineGap", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_gripLineLength", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_height", void 0);
