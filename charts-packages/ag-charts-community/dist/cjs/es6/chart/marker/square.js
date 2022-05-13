"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Square extends marker_1.Marker {
    updatePath() {
        const { path, x, y } = this;
        const hs = this.size / 2;
        const { alignment: a, align: al } = this;
        path.clear();
        path.moveTo(al(a, x - hs), al(a, y - hs));
        path.lineTo(al(a, x + hs), al(a, y - hs));
        path.lineTo(al(a, x + hs), al(a, y + hs));
        path.lineTo(al(a, x - hs), al(a, y + hs));
        path.closePath();
    }
}
exports.Square = Square;
Square.className = 'Square';
//# sourceMappingURL=square.js.map