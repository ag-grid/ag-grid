var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path, ScenePathChangeDetection } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
export class Marker extends Path {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.size = 12;
    }
    computeBBox() {
        const { x, y, size } = this;
        const half = size / 2;
        return new BBox(x - half, y - half, size, size);
    }
    applyPath(s, moves) {
        const { path } = this;
        let { x, y } = this;
        path.clear();
        for (const { x: mx, y: my, t } of moves) {
            x += mx * s;
            y += my * s;
            if (t === 'move') {
                path.moveTo(x, y);
            }
            else {
                path.lineTo(x, y);
            }
        }
        path.closePath();
    }
}
__decorate([
    ScenePathChangeDetection()
], Marker.prototype, "x", void 0);
__decorate([
    ScenePathChangeDetection()
], Marker.prototype, "y", void 0);
__decorate([
    ScenePathChangeDetection({ convertor: Math.abs })
], Marker.prototype, "size", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L21hcmtlci9tYXJrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUl4QyxNQUFNLE9BQWdCLE1BQU8sU0FBUSxJQUFJO0lBQXpDOztRQUVJLE1BQUMsR0FBVyxDQUFDLENBQUM7UUFHZCxNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBR2QsU0FBSSxHQUFXLEVBQUUsQ0FBQztJQXlCdEIsQ0FBQztJQXZCRyxXQUFXO1FBQ1AsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzVCLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7UUFFdEIsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFUyxTQUFTLENBQUMsQ0FBUyxFQUFFLEtBQXVCO1FBQ2xELE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFcEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsS0FBSyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEtBQUssRUFBRTtZQUNyQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLEtBQUssTUFBTSxFQUFFO2dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3JCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3JCO1NBQ0o7UUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBL0JHO0lBREMsd0JBQXdCLEVBQUU7aUNBQ2I7QUFHZDtJQURDLHdCQUF3QixFQUFFO2lDQUNiO0FBR2Q7SUFEQyx3QkFBd0IsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7b0NBQ2hDIn0=