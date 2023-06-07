var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BOOLEAN, COLOR_STRING, NUMBER, Validate } from '../util/validation';
import { ChangeDetectable, RedrawType } from './changeDetectable';
import { SceneChangeDetection } from './node';
export class DropShadow extends ChangeDetectable {
    constructor() {
        super(...arguments);
        this.enabled = true;
        this.color = 'rgba(0, 0, 0, 0.5)';
        this.xOffset = 0;
        this.yOffset = 0;
        this.blur = 5;
    }
}
__decorate([
    Validate(BOOLEAN),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "enabled", void 0);
__decorate([
    Validate(COLOR_STRING),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "color", void 0);
__decorate([
    Validate(NUMBER()),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "xOffset", void 0);
__decorate([
    Validate(NUMBER()),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "yOffset", void 0);
__decorate([
    Validate(NUMBER(0)),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "blur", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcFNoYWRvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9kcm9wU2hhZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM3RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbEUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRTlDLE1BQU0sT0FBTyxVQUFXLFNBQVEsZ0JBQWdCO0lBQWhEOztRQUdJLFlBQU8sR0FBRyxJQUFJLENBQUM7UUFJZixVQUFLLEdBQUcsb0JBQW9CLENBQUM7UUFJN0IsWUFBTyxHQUFHLENBQUMsQ0FBQztRQUlaLFlBQU8sR0FBRyxDQUFDLENBQUM7UUFJWixTQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztDQUFBO0FBakJHO0lBRkMsUUFBUSxDQUFDLE9BQU8sQ0FBQztJQUNqQixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7MkNBQ3BDO0FBSWY7SUFGQyxRQUFRLENBQUMsWUFBWSxDQUFDO0lBQ3RCLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt5Q0FDdEI7QUFJN0I7SUFGQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOzJDQUN2QztBQUlaO0lBRkMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzsyQ0FDdkM7QUFJWjtJQUZDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO3dDQUMxQyJ9