"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Triangle = void 0;
const marker_1 = require("./marker");
class Triangle extends marker_1.Marker {
    updatePath() {
        const s = this.size * 1.1;
        super.applyPath(s, Triangle.moves);
    }
}
exports.Triangle = Triangle;
Triangle.className = 'Triangle';
Triangle.moves = [
    { x: 0, y: -0.48, t: 'move' },
    { x: 0.5, y: 0.87 },
    { x: -1, y: 0 },
];
