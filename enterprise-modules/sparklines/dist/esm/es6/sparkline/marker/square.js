import { Marker } from './marker';
export class Square extends Marker {
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
Square.className = 'Square';
