import { Marker } from './marker';
export class Circle extends Marker {
    isPointInPath(x, y) {
        return false;
    }
    isPointInStroke(x, y) {
        return false;
    }
    render(ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        const { x, y, size } = this;
        const radius = size / 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.fillStroke(ctx);
        this.dirty = false;
    }
}
Circle.className = 'Circle';
