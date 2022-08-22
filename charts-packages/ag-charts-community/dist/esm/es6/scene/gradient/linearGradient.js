import { Gradient } from './gradient';
export class LinearGradient extends Gradient {
    constructor() {
        super(...arguments);
        this.angle = 0;
    }
    createGradient(ctx, bbox) {
        const { stops } = this;
        const radians = ((this.angle % 360) * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const w = bbox.width;
        const h = bbox.height;
        const cx = bbox.x + w * 0.5;
        const cy = bbox.y + h * 0.5;
        if (w > 0 && h > 0) {
            const l = (Math.sqrt(h * h + w * w) * Math.abs(Math.cos(radians - Math.atan(h / w)))) / 2;
            const gradient = ctx.createLinearGradient(cx + cos * l, cy + sin * l, cx - cos * l, cy - sin * l);
            stops.forEach((stop) => {
                gradient.addColorStop(stop.offset, stop.color);
            });
            return gradient;
        }
        return 'black';
    }
}
