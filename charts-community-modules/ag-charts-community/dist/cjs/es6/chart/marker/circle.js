"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Circle = void 0;
const marker_1 = require("./marker");
class Circle extends marker_1.Marker {
    updatePath() {
        const { x, y, path, size } = this;
        const r = size / 2;
        path.clear();
        path.arc(x, y, r, 0, Math.PI * 2);
        path.closePath();
    }
}
exports.Circle = Circle;
Circle.className = 'Circle';
