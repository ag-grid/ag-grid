import { Path, ScenePathChangeDetection } from './path';
import { normalizeAngle360 } from '../../util/angle';
import { isEqual } from '../../util/number';
import { BBox } from '../bbox';

export class Sector extends Path {
    static className = 'Sector';

    @ScenePathChangeDetection()
    centerX: number = 0;

    @ScenePathChangeDetection()
    centerY: number = 0;

    @ScenePathChangeDetection()
    innerRadius: number = 10;

    @ScenePathChangeDetection()
    outerRadius: number = 20;

    @ScenePathChangeDetection()
    startAngle: number = 0;

    @ScenePathChangeDetection()
    endAngle: number = Math.PI * 2;

    @ScenePathChangeDetection()
    angleOffset: number = 0;

    computeBBox(): BBox {
        const radius = this.outerRadius;
        return new BBox(this.centerX - radius, this.centerY - radius, radius * 2, radius * 2);
    }

    private isFullPie(): boolean {
        return isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
    }

    updatePath(): void {
        const path = this.path;

        const angleOffset = this.angleOffset;
        const startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        const endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const fullPie = this.isFullPie();
        let centerX = this.centerX;
        let centerY = this.centerY;

        path.clear();

        if (!fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            path.lineTo(centerX + outerRadius * Math.cos(startAngle), centerY + outerRadius * Math.sin(startAngle));
        }

        path.cubicArc(centerX, centerY, outerRadius, outerRadius, 0, startAngle, endAngle, 0);
        if (fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
        } else {
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            const x = centerX + innerRadius * Math.cos(endAngle);
            path.lineTo(Math.abs(x) < 1e-8 ? 0 : x, centerY + innerRadius * Math.sin(endAngle));
        }
        path.cubicArc(centerX, centerY, innerRadius, innerRadius, 0, endAngle, startAngle, 1);
        path.closePath();

        this.dirtyPath = false;
    }
}
