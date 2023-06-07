var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Rect } from '../../scene/shape/rect';
import { Group } from '../../scene/group';
import { BaseModuleInstance } from '../../util/module';
import { ProxyPropertyOnWrite } from '../../util/proxy';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../../util/validation';
import { Layers } from '../layers';
export class Background extends BaseModuleInstance {
    constructor(ctx) {
        var _a;
        super();
        this.onLayoutComplete = (e) => {
            const { width, height } = e.chart;
            this.rectNode.width = width;
            this.rectNode.height = height;
        };
        this.node = new Group({ name: 'background' });
        this.node.zIndex = Layers.SERIES_BACKGROUND_ZINDEX;
        this.rectNode = new Rect();
        this.node.appendChild(this.rectNode);
        this.fill = 'white';
        this.visible = true;
        (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(this.node);
        this.destroyFns.push(() => { var _a; return (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(this.node); });
        const layoutHandle = ctx.layoutService.addListener('layout-complete', this.onLayoutComplete);
        this.destroyFns.push(() => ctx.layoutService.removeListener(layoutHandle));
    }
}
__decorate([
    Validate(BOOLEAN),
    ProxyPropertyOnWrite('node', 'visible')
], Background.prototype, "visible", void 0);
__decorate([
    Validate(OPT_COLOR_STRING),
    ProxyPropertyOnWrite('rectNode', 'fill')
], Background.prototype, "fill", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9iYWNrZ3JvdW5kL2JhY2tncm91bmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsa0JBQWtCLEVBQWlDLE1BQU0sbUJBQW1CLENBQUM7QUFDdEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRW5DLE1BQU0sT0FBTyxVQUFXLFNBQVEsa0JBQWtCO0lBSTlDLFlBQVksR0FBa0I7O1FBQzFCLEtBQUssRUFBRSxDQUFDO1FBd0JKLHFCQUFnQixHQUFHLENBQUMsQ0FBc0IsRUFBRSxFQUFFO1lBQ2xELE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ2xDLENBQUMsQ0FBQztRQTFCRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDO1FBQ25ELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFFcEIsTUFBQSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksMENBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsV0FBQyxPQUFBLE1BQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLDBDQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsRUFBQSxDQUFDLENBQUM7UUFFbkUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0NBZUo7QUFYRztJQUZDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDakIsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQzsyQ0FDdkI7QUFJakI7SUFGQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7SUFDMUIsb0JBQW9CLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQzt3Q0FDaEIifQ==