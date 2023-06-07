var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Node, RedrawType, SceneChangeDetection } from './node';
export class Image extends Node {
    constructor(sourceImage) {
        super();
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.opacity = 1;
        this.sourceImage = sourceImage;
    }
    render(renderCtx) {
        const { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        const image = this.sourceImage;
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(image, 0, 0, image.width, image.height, this.x, this.y, this.width, this.height);
        super.render(renderCtx);
    }
}
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "x", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "y", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "width", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "height", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "opacity", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQWlCLE1BQU0sUUFBUSxDQUFDO0FBRS9FLE1BQU0sT0FBTyxLQUFNLFNBQVEsSUFBSTtJQUczQixZQUFZLFdBQTZCO1FBQ3JDLEtBQUssRUFBRSxDQUFDO1FBS1osTUFBQyxHQUFXLENBQUMsQ0FBQztRQUdkLE1BQUMsR0FBVyxDQUFDLENBQUM7UUFHZCxVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBR2xCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFHbkIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQWhCaEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDbkMsQ0FBQztJQWlCRCxNQUFNLENBQUMsU0FBd0I7UUFDM0IsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBRTlDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hELElBQUksS0FBSztnQkFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEMsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUMvQixHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDL0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9GLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBOUJHO0lBREMsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO2dDQUNyQztBQUdkO0lBREMsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO2dDQUNyQztBQUdkO0lBREMsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO29DQUNqQztBQUdsQjtJQURDLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztxQ0FDaEM7QUFHbkI7SUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7c0NBQy9CIn0=