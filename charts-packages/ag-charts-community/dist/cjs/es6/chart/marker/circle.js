"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Circle extends marker_1.Marker {
    updatePath() {
        const { x, y, path, size } = this;
        const r = size / 2;
        path.clear();
        path.cubicArc(x, y, r, r, 0, 0, Math.PI * 2, 0);
        path.closePath();
    }
}
exports.Circle = Circle;
Circle.className = 'Circle';
