"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marker_1 = require("./marker");
class Square extends marker_1.Marker {
    isPointInStroke(x, y) {
        return false;
    }
    isPointInPath(x, y) {
        return false;
    }
    render(ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        let { x, y, size } = this;
        const hs = size / 2;
        ctx.beginPath();
        ctx.moveTo((x -= hs), (y -= hs));
        ctx.lineTo((x += size), y);
        ctx.lineTo(x, (y += size));
        ctx.lineTo((x -= size), y);
        ctx.lineTo(x, (y -= size));
        ctx.closePath();
        this.fillStroke(ctx);
        this.dirty = false;
    }
}
exports.Square = Square;
Square.className = 'Square';
