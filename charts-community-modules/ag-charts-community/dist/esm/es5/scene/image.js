var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Node, RedrawType, SceneChangeDetection } from './node';
var Image = /** @class */ (function (_super) {
    __extends(Image, _super);
    function Image(sourceImage) {
        var _this = _super.call(this) || this;
        _this.x = 0;
        _this.y = 0;
        _this.width = 0;
        _this.height = 0;
        _this.opacity = 1;
        _this.sourceImage = sourceImage;
        return _this;
    }
    Image.prototype.render = function (renderCtx) {
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        var image = this.sourceImage;
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(image, 0, 0, image.width, image.height, this.x, this.y, this.width, this.height);
        _super.prototype.render.call(this, renderCtx);
    };
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
    return Image;
}(Node));
export { Image };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQWlCLE1BQU0sUUFBUSxDQUFDO0FBRS9FO0lBQTJCLHlCQUFJO0lBRzNCLGVBQVksV0FBNkI7UUFBekMsWUFDSSxpQkFBTyxTQUVWO1FBR0QsT0FBQyxHQUFXLENBQUMsQ0FBQztRQUdkLE9BQUMsR0FBVyxDQUFDLENBQUM7UUFHZCxXQUFLLEdBQVcsQ0FBQyxDQUFDO1FBR2xCLFlBQU0sR0FBVyxDQUFDLENBQUM7UUFHbkIsYUFBTyxHQUFXLENBQUMsQ0FBQztRQWhCaEIsS0FBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7O0lBQ25DLENBQUM7SUFpQkQsc0JBQU0sR0FBTixVQUFPLFNBQXdCO1FBQ25CLElBQUEsR0FBRyxHQUF5QixTQUFTLElBQWxDLEVBQUUsV0FBVyxHQUFZLFNBQVMsWUFBckIsRUFBRSxLQUFLLEdBQUssU0FBUyxNQUFkLENBQWU7UUFFOUMsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEQsSUFBSSxLQUFLO2dCQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNoQyxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUzQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMvQixHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0YsaUJBQU0sTUFBTSxZQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUE3QkQ7UUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7b0NBQ3JDO0lBR2Q7UUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7b0NBQ3JDO0lBR2Q7UUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7d0NBQ2pDO0lBR2xCO1FBREMsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO3lDQUNoQztJQUduQjtRQURDLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzswQ0FDL0I7SUFrQnhCLFlBQUM7Q0FBQSxBQXZDRCxDQUEyQixJQUFJLEdBdUM5QjtTQXZDWSxLQUFLIn0=