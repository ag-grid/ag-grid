"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Plus extends marker_1.Marker {
    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size / 3;
        const hs = s / 2;
        path.clear();
        path.moveTo((x -= hs), (y -= hs));
        path.lineTo(x, (y -= s));
        path.lineTo((x += s), y);
        path.lineTo(x, (y += s));
        path.lineTo((x += s), y);
        path.lineTo(x, (y += s));
        path.lineTo((x -= s), y);
        path.lineTo(x, (y += s));
        path.lineTo((x -= s), y);
        path.lineTo(x, (y -= s));
        path.lineTo((x -= s), y);
        path.lineTo(x, y - s);
        path.closePath();
    }
}
exports.Plus = Plus;
Plus.className = 'Plus';
