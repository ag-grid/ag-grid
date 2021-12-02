import { Marker } from "./marker";

export class Square extends Marker {

    static className = "Square";

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    isPointInPath(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        let { x, y, size } = this;
        const hs = size / 2;

        ctx.beginPath();

        ctx.moveTo(x -= hs, y -= hs);
        ctx.lineTo(x += size, y);
        ctx.lineTo(x, y += size);
        ctx.lineTo(x -= size, y);
        ctx.lineTo(x, y -= size);

        ctx.closePath();

        this.fillStroke(ctx);

        this.dirty = false;
    }
}