"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Square = void 0;
const marker_1 = require("./marker");
class Square extends marker_1.Marker {
    updatePath() {
        const { path, x, y } = this;
        const hs = this.size / 2;
        path.clear();
        path.moveTo(this.align(x - hs), this.align(y - hs));
        path.lineTo(this.align(x + hs), this.align(y - hs));
        path.lineTo(this.align(x + hs), this.align(y + hs));
        path.lineTo(this.align(x - hs), this.align(y + hs));
        path.closePath();
    }
}
exports.Square = Square;
Square.className = 'Square';
