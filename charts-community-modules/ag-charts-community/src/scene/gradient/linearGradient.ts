import { Gradient } from './gradient';
import { BBox } from '../bbox';
import { toRadians } from '../../util/angle';

export class LinearGradient extends Gradient {
    angle = 0;

    createGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string {
        const { stops } = this;
        let { angle } = this;
        angle = (((angle + 90) % 360) + 360) % 360;
        const radians = toRadians(angle);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const w = bbox.width;
        const h = bbox.height;
        const cx = bbox.x + w * 0.5;
        const cy = bbox.y + h * 0.5;

        if (w > 0 && h > 0) {
            const d = Math.sqrt(h * h + w * w) / 2;
            const a = Math.atan2(h, w);
            const r =
                angle <= 90
                    ? radians
                    : angle <= 180
                    ? Math.PI - radians
                    : angle <= 270
                    ? radians - Math.PI
                    : 2 * Math.PI - radians;
            const l = d * Math.abs(Math.cos(r - a));
            const gradient = ctx.createLinearGradient(cx + cos * l, cy + sin * l, cx - cos * l, cy - sin * l);

            stops.forEach((stop) => {
                gradient.addColorStop(stop.offset, stop.color);
            });

            return gradient;
        }

        return 'black';
    }
}
