var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path, ScenePathChangeDetection } from './path';
import { normalizeAngle360 } from '../../util/angle';
import { isEqual } from '../../util/number';
import { isPointInSector } from '../../util/sector';
import { BBox } from '../bbox';
export class Sector extends Path {
    constructor() {
        super(...arguments);
        this.centerX = 0;
        this.centerY = 0;
        this.innerRadius = 10;
        this.outerRadius = 20;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
        this.angleOffset = 0;
    }
    computeBBox() {
        const radius = this.outerRadius;
        return new BBox(this.centerX - radius, this.centerY - radius, radius * 2, radius * 2);
    }
    updatePath() {
        const path = this.path;
        const angleOffset = this.angleOffset;
        const startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        const endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const fullPie = isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
        const centerX = this.centerX;
        const centerY = this.centerY;
        path.clear();
        if (fullPie) {
            path.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            if (innerRadius > 0) {
                path.moveTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
                path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            }
        }
        else {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            path.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            if (innerRadius > 0) {
                path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            }
            else {
                path.lineTo(centerX, centerY);
            }
        }
        path.closePath();
        this.dirtyPath = false;
    }
    isPointInPath(x, y) {
        const { angleOffset } = this;
        const startAngle = this.startAngle + angleOffset;
        const endAngle = this.endAngle + angleOffset;
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const point = this.transformPoint(x, y);
        return isPointInSector(point.x, point.y, { startAngle, endAngle, innerRadius, outerRadius });
    }
}
Sector.className = 'Sector';
__decorate([
    ScenePathChangeDetection()
], Sector.prototype, "centerX", void 0);
__decorate([
    ScenePathChangeDetection()
], Sector.prototype, "centerY", void 0);
__decorate([
    ScenePathChangeDetection()
], Sector.prototype, "innerRadius", void 0);
__decorate([
    ScenePathChangeDetection()
], Sector.prototype, "outerRadius", void 0);
__decorate([
    ScenePathChangeDetection()
], Sector.prototype, "startAngle", void 0);
__decorate([
    ScenePathChangeDetection()
], Sector.prototype, "endAngle", void 0);
__decorate([
    ScenePathChangeDetection()
], Sector.prototype, "angleOffset", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3NoYXBlL3NlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ3hELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM1QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUUvQixNQUFNLE9BQU8sTUFBTyxTQUFRLElBQUk7SUFBaEM7O1FBSUksWUFBTyxHQUFXLENBQUMsQ0FBQztRQUdwQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBR3BCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBR3pCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBR3pCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFHdkIsYUFBUSxHQUFXLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRy9CLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO0lBc0Q1QixDQUFDO0lBcERHLFdBQVc7UUFDUCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVELFVBQVU7UUFDTixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRXZCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDckMs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