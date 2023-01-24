import { Path, ScenePathChangeDetection } from './path';
import { normalizeAngle360, normalizeAngle360Inclusive } from '../../util/angle';
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

    updatePath(): void {
        const path = this.path;

        const angleOffset = this.angleOffset;
        const startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        const endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const fullPie = isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
        let centerX = this.centerX;
        let centerY = this.centerY;

        path.clear();

        if (!fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            path.lineTo(centerX + outerRadius * Math.cos(startAngle), centerY + outerRadius * Math.sin(startAngle));
        }

        path.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        if (innerRadius > 0) {
            path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        } else {
            path.lineTo(centerX, centerY);
        }
        path.closePath();

        this.dirtyPath = false;
    }

    isPointInPath(x: number, y: number): boolean {
        const { angleOffset } = this;
        const startAngle = normalizeAngle360Inclusive(Math.min(this.startAngle, this.endAngle) + angleOffset);
        const endAngle = normalizeAngle360Inclusive(Math.max(this.startAngle, this.endAngle) + angleOffset);
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);

        const point = this.transformPoint(x, y);

        const deltaX = point.x - this.centerX;
        const deltaY = point.y - this.centerY;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        if (distance < innerRadius || distance > outerRadius) {
            return false;
        }

        const angle = normalizeAngle360Inclusive(Math.atan2(deltaY, deltaX));
        if (startAngle > endAngle) {
            // Sector passes through 0-angle.
            return startAngle < angle || endAngle > angle;
        }
        return startAngle < angle && endAngle > angle;
    }
}
