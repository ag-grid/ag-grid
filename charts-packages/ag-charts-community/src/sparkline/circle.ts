import { Marker } from './marker';
export class Circle extends Marker {

    static className = 'Circle';

    isPointInPath(x: number, y: number) {
        return false;
    }

    isPointInStroke(x: number, y: number) {
        return false;
    }

    render(ctx: CanvasRenderingContext2D) {
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