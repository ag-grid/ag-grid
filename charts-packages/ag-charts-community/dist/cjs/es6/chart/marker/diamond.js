"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Diamond extends marker_1.Marker {
    updatePath() {
        const s = this.size / 2;
        super.applyPath(s, Diamond.moves);
    }
}
exports.Diamond = Diamond;
Diamond.className = 'Diamond';
Diamond.moves = [
    { x: 0, y: -1, t: 'move' },
    { x: +1, y: +1 },
    { x: -1, y: +1 },
    { x: -1, y: -1 },
    { x: +1, y: -1 },
];
