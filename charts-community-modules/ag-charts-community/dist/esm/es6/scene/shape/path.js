var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { Path2D } from '../path2D';
import { RedrawType, SceneChangeDetection } from '../node';
export function ScenePathChangeDetection(opts) {
    const { redraw = RedrawType.MAJOR, changeCb, convertor } = opts !== null && opts !== void 0 ? opts : {};
    return SceneChangeDetection({ redraw, type: 'path', convertor, changeCb });
}
export class Path extends Shape {
    constructor() {
        super(...arguments);
        /**
         * Declare a path to retain for later rendering and hit testing
         * using custom Path2D class. Think of it as a TypeScript version
         * of the native Path2D (with some differences) that works in all browsers.
         */
        this.path = new Path2D();
        /**
         * The path only has to be updated when certain attributes change.
         * For example, if transform attributes (such as `translationX`)
         * are changed, we don't have to update the path. The `dirtyPath` flag
         * is how we keep track if the path has to be updated or not.
         */
        this._dirtyPath = true;
    }
    set dirtyPath(value) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.markDirty(this, RedrawType.MAJOR);
            }
        }
    }
    get dirtyPath() {
        return this._dirtyPath;
    }
    checkPathDirty() {
        var _a, _b;
        if (this._dirtyPath) {
            return;
        }
        this.dirtyPath = this.path.isDirty() || ((_b = (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.isDirty()) !== null && _b !== void 0 ? _b : false);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    }
    isDirtyPath() {
        // Override point for more expensive dirty checks.
        return false;
    }
    updatePath() {
        // Override point for subclasses.
    }
    render(renderCtx) {
        var _a, _b;
        const { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        if (this.dirtyPath || this.isDirtyPath()) {
            this.updatePath();
            this.dirtyPath = false;
        }
        if (this.clipPath) {
            ctx.save();
            if (this.clipMode === 'normal') {
                // Bound the shape rendered to the clipping path.
                this.clipPath.draw(ctx);
                ctx.clip();
            }
            this.path.draw(ctx);
            this.fillStroke(ctx);
            if (this.clipMode === 'punch-out') {
                // Bound the shape rendered to outside the clipping path.
                this.clipPath.draw(ctx);
                ctx.clip();
                // Fallback values, but practically these should never be used.
                const { x = -10000, y = -10000, width = 20000, height = 20000 } = (_a = this.computeBBox()) !== null && _a !== void 0 ? _a : {};
                ctx.clearRect(x, y, width, height);
            }
            ctx.restore();
        }
        else {
            this.path.draw(ctx);
            this.fillStroke(ctx);
        }
        (_b = this.fillShadow) === null || _b === void 0 ? void 0 : _b.markClean();
        super.render(renderCtx);
    }
}
Path.className = 'Path';
__decorate([
    ScenePathChangeDetection()
], Path.prototype, "clipPath", void 0);
__decorate([
    ScenePathChangeDetection()
], Path.prototype, "clipMode", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFwZS9wYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNuQyxPQUFPLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFpQixNQUFNLFNBQVMsQ0FBQztBQUUxRSxNQUFNLFVBQVUsd0JBQXdCLENBQUMsSUFJeEM7SUFDRyxNQUFNLEVBQUUsTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsQ0FBQztJQUV0RSxPQUFPLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUVELE1BQU0sT0FBTyxJQUFLLFNBQVEsS0FBSztJQUEvQjs7UUFHSTs7OztXQUlHO1FBQ00sU0FBSSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFRN0I7Ozs7O1dBS0c7UUFDSyxlQUFVLEdBQUcsSUFBSSxDQUFDO0lBaUY5QixDQUFDO0lBaEZHLElBQUksU0FBUyxDQUFDLEtBQWM7UUFDeEIsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtZQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLEtBQUssRUFBRTtnQkFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUM7U0FDSjtJQUNMLENBQUM7SUFDRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVELGNBQWM7O1FBQ1YsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQUEsTUFBQSxJQUFJLENBQUMsVUFBVSwwQ0FBRSxPQUFPLEVBQUUsbUNBQUksS0FBSyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVELGFBQWEsQ0FBQyxDQUFTLEVBQUUsQ0FBUztRQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFUyxXQUFXO1FBQ2pCLGtEQUFrRDtRQUNsRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsVUFBVTtRQUNOLGlDQUFpQztJQUNyQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQXdCOztRQUMzQixNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFFOUMsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEQsSUFBSSxLQUFLO2dCQUFFLEtBQUssQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDdEQsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0IsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN0QyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7U0FDMUI7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFWCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUM1QixpREFBaUQ7Z0JBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDZDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFckIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRTtnQkFDL0IseURBQXlEO2dCQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNYLCtEQUErRDtnQkFDL0QsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxNQUFNLEdBQUcsS0FBSyxFQUFFLEdBQUcsTUFBQSxJQUFJLENBQUMsV0FBVyxFQUFFLG1DQUFJLEVBQUUsQ0FBQztnQkFDM0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzthQUN0QztZQUVELEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNqQjthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QjtRQUVELE1BQUEsSUFBSSxDQUFDLFVBQVUsMENBQUUsU0FBUyxFQUFFLENBQUM7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QixDQUFDOztBQXJHTSxjQUFTLEdBQUcsTUFBTSxDQUFDO0FBVTFCO0lBREMsd0JBQXdCLEVBQUU7c0NBQ1Q7QUFHbEI7SUFEQyx3QkFBd0IsRUFBRTtzQ0FDTyJ9