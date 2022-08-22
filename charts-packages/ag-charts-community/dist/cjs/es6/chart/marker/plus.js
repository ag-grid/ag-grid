"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Plus extends marker_1.Marker {
    updatePath() {
        const s = this.size / 3;
        super.applyPath(s, Plus.moves);
    }
}
exports.Plus = Plus;
Plus.className = 'Plus';
Plus.moves = [
    { x: -0.5, y: -0.5, t: 'move' },
    { x: 0, y: -1 },
    { x: +1, y: 0 },
    { x: 0, y: +1 },
    { x: +1, y: 0 },
    { x: 0, y: +1 },
    { x: -1, y: 0 },
    { x: 0, y: +1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
];
