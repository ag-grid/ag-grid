"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Triangle extends marker_1.Marker {
    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size * 1.1;
        path.clear();
        path.moveTo(x, (y -= s * 0.48));
        path.lineTo((x += s * 0.5), (y += s * 0.87));
        path.lineTo(x - s, y);
        path.closePath();
    }
}
exports.Triangle = Triangle;
Triangle.className = 'Triangle';
