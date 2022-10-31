"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NavigatorHandle {
    constructor(rangeHandle) {
        this.rh = rangeHandle;
    }
    set fill(value) {
        this.rh.fill = value;
    }
    get fill() {
        return this.rh.fill;
    }
    set stroke(value) {
        this.rh.stroke = value;
    }
    get stroke() {
        return this.rh.stroke;
    }
    set strokeWidth(value) {
        this.rh.strokeWidth = value;
    }
    get strokeWidth() {
        return this.rh.strokeWidth;
    }
    set width(value) {
        this.rh.width = value;
    }
    get width() {
        return this.rh.width;
    }
    set height(value) {
        this.rh.height = value;
    }
    get height() {
        return this.rh.height;
    }
    set gripLineGap(value) {
        this.rh.gripLineGap = value;
    }
    get gripLineGap() {
        return this.rh.gripLineGap;
    }
    set gripLineLength(value) {
        this.rh.gripLineLength = value;
    }
    get gripLineLength() {
        return this.rh.gripLineLength;
    }
}
exports.NavigatorHandle = NavigatorHandle;
