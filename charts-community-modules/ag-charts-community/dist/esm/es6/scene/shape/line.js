var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { BBox } from '../bbox';
import { RedrawType, SceneChangeDetection } from '../node';
export class Line extends Shape {
    constructor() {
        super();
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.restoreOwnStyles();
    }
    computeBBox() {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    }
    isPointInPath(_x, _y) {
        return false;
    }
    render(renderCtx) {
        var _a;
        const { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        let x1 = this.x1;
        let y1 = this.y1;
        let x2 = this.x2;
        let y2 = this.y2;
        // Align to the pixel grid if the line is strictly vertical
        // or horizontal (but not both, i.e. a dot).
        if (x1 === x2) {
            const x = Math.round(x1) + (Math.floor(this.strokeWidth) % 2) / 2;
            x1 = x;
            x2 = x;
        }
        else if (y1 === y2) {
            const y = Math.round(y1) + (Math.floor(this.strokeWidth) % 2) / 2;
            y1 = y;
            y2 = y;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        this.fillStroke(ctx);
        (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.markClean();
        super.render(renderCtx);
    }
}
Line.className = 'Line';
Line.defaultStyles = Object.assign({}, Shape.defaultStyles, {
    fill: undefined,
    strokeWidth: 1,
});
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Line.prototype, "x1", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Line.prototype, "y1", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Line.prototype, "x2", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Line.prototype, "y2", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFwZS9saW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMvQixPQUFPLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFpQixNQUFNLFNBQVMsQ0FBQztBQUUxRSxNQUFNLE9BQU8sSUFBSyxTQUFRLEtBQUs7SUFRM0I7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUtaLE9BQUUsR0FBVyxDQUFDLENBQUM7UUFHZixPQUFFLEdBQVcsQ0FBQyxDQUFDO1FBR2YsT0FBRSxHQUFXLENBQUMsQ0FBQztRQUdmLE9BQUUsR0FBVyxDQUFDLENBQUM7UUFiWCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBY0QsV0FBVztRQUNQLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQsYUFBYSxDQUFDLEVBQVUsRUFBRSxFQUFVO1FBQ2hDLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFNLENBQUMsU0FBd0I7O1FBQzNCLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUU5QyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoRCxJQUFJLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUN0RCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUzQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2pCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDakIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNqQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBRWpCLDJEQUEyRDtRQUMzRCw0Q0FBNEM7UUFDNUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ1gsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1AsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNWO2FBQU0sSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNQLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDVjtRQUVELEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVuQixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLE1BQUEsSUFBSSxDQUFDLFVBQVUsMENBQUUsU0FBUyxFQUFFLENBQUM7UUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QixDQUFDOztBQXBFTSxjQUFTLEdBQUcsTUFBTSxDQUFDO0FBRVQsa0JBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFO0lBQ3BFLElBQUksRUFBRSxTQUFTO0lBQ2YsV0FBVyxFQUFFLENBQUM7Q0FDakIsQ0FBQyxDQUFDO0FBUUg7SUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0NBQ3BDO0FBR2Y7SUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0NBQ3BDO0FBR2Y7SUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0NBQ3BDO0FBR2Y7SUFEQyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0NBQ3BDIn0=