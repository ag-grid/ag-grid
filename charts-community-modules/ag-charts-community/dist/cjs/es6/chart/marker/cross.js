"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cross = void 0;
const marker_1 = require("./marker");
class Cross extends marker_1.Marker {
    updatePath() {
        const s = this.size / 4.2;
        super.applyPath(s, Cross.moves);
    }
}
exports.Cross = Cross;
Cross.className = 'Cross';
Cross.moves = [
    { x: -1, y: 0, t: 'move' },
    { x: -1, y: -1 },
    { x: +1, y: -1 },
    { x: +1, y: +1 },
    { x: +1, y: -1 },
    { x: +1, y: +1 },
    { x: -1, y: +1 },
    { x: +1, y: +1 },
    { x: -1, y: +1 },
    { x: -1, y: -1 },
    { x: -1, y: +1 },
    { x: -1, y: -1 },
];
