"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Diamond extends marker_1.Marker {
    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size / 2;
        path.clear();
        path.moveTo(x, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x += s, y -= s);
        path.closePath();
    }
}
exports.Diamond = Diamond;
Diamond.className = 'Diamond';
//# sourceMappingURL=diamond.js.map