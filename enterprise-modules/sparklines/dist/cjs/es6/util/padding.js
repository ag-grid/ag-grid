"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Padding {
    constructor(top = 0, right = top, bottom = top, left = right) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    clear() {
        this.top = this.right = this.bottom = this.left = 0;
    }
}
exports.Padding = Padding;
