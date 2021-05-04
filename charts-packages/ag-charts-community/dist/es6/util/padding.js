var Padding = /** @class */ (function () {
    function Padding(top, right, bottom, left) {
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = top; }
        if (bottom === void 0) { bottom = top; }
        if (left === void 0) { left = right; }
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    Padding.prototype.clear = function () {
        this.top = this.right = this.bottom = this.left = 0;
    };
    return Padding;
}());
export { Padding };
