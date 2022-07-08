"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Cross extends marker_1.Marker {
    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size / 4.2;
        path.clear();
        path.moveTo(x -= s, y);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x += s, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x += s, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.closePath();
    }
}
exports.Cross = Cross;
Cross.className = 'Cross';
