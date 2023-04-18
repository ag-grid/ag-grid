import { Gradient } from './gradient';
import { BBox } from '../bbox';
import { toRadians, normalizeAngle360 } from '../../util/angle';

export class LinearGradient extends Gradient {
    angle = 0;

    createGradient(ctx: CanvasRenderingContext2D, bbox: BBox): CanvasGradient | string {
        // Gradient 0° angle starts at top according to CSS spec
        const angleOffset = 90;
        const { stops, angle } = this;
        const radians = normalizeAngle360(toRadians(angle + angleOffset));
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const w = bbox.width;
        const h = bbox.height;
        const cx = bbox.x + w * 0.5;
        const cy = bbox.y + h * 0.5;

        if (w > 0 && h > 0) {
            const diagonal = Math.sqrt(h * h + w * w) / 2;
            const diagonalAngle = Math.atan2(h, w);

            let quarteredAngle: number;
            if (radians < Math.PI / 2) {
                quarteredAngle = radians;
            } else if (radians < Math.PI) {
                quarteredAngle = Math.PI - radians;
            } else if (radians < (3 * Math.PI) / 2) {
                quarteredAngle = radians - Math.PI;
            } else {
                quarteredAngle = 2 * Math.PI - radians;
            }

            const l = diagonal * Math.abs(Math.cos(quarteredAngle - diagonalAngle));
            const gradient = ctx.createLinearGradient(cx + cos * l, cy + sin * l, cx - cos * l, cy - sin * l);

            stops.forEach((stop) => {
                gradient.addColorStop(stop.offset, stop.color);
            });

            return gradient;
        }

        return 'black';
    }
}
