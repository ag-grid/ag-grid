import { Marker } from './marker';

export class Diamond extends Marker {

    static className = 'Diamond';
    
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
        ctx.moveTo(x, y -= hs);

        ctx.lineTo(x += hs, y += hs);
        ctx.lineTo(x -= hs, y += hs);
        ctx.lineTo(x -= hs, y -= hs);
        ctx.lineTo(x += hs, y -= hs);
        
        ctx.closePath();

        this.fillStroke(ctx);

        this.dirty = false;
    }
}