var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { Path, ScenePathChangeDetection } from './path';
import { BBox } from '../bbox';
import { normalizeAngle360 } from '../../util/angle';
import { isEqual } from '../../util/number';
var ArcType;
(function (ArcType) {
    ArcType[ArcType["Open"] = 0] = "Open";
    ArcType[ArcType["Chord"] = 1] = "Chord";
    ArcType[ArcType["Round"] = 2] = "Round";
})(ArcType || (ArcType = {}));
/**
 * Elliptical arc node.
 */
export class Arc extends Path {
    constructor() {
        super();
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 10;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
        this.counterClockwise = false;
        /**
         * The type of arc to render:
         * - {@link ArcType.Open} - end points of the arc segment are not connected (default)
         * - {@link ArcType.Chord} - end points of the arc segment are connected by a line segment
         * - {@link ArcType.Round} - each of the end points of the arc segment are connected
         *                           to the center of the arc
         * Arcs with {@link ArcType.Open} do not support hit testing, even if they have their
         * {@link Shape.fillStyle} set, because they are not closed paths. Hit testing support
         * would require using two paths - one for rendering, another for hit testing - and there
         * doesn't seem to be a compelling reason to do that, when one can just use {@link ArcType.Chord}
         * to create a closed path.
         */
        this.type = ArcType.Open;
        this.restoreOwnStyles();
    }
    get fullPie() {
        return isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
    }
    updatePath() {
        const path = this.path;
        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        path.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
        if (this.type === ArcType.Chord) {
            path.closePath();
        }
        else if (this.type === ArcType.Round && !this.fullPie) {
            path.lineTo(this.centerX, this.centerY);
            path.closePath();
        }
    }
    computeBBox() {
        // Only works with full arcs (circles) and untransformed ellipses.
        return new BBox(this.centerX - this.radius, this.centerY - this.radius, this.radius * 2, this.radius * 2);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return (this.type !== ArcType.Open &&
            bbox.containsPoint(point.x, point.y) &&
            this.path.isPointInPath(point.x, point.y));
    }
}
Arc.className = 'Arc';
Arc.defaultStyles = Object.assign({}, Shape.defaultStyles, {
    lineWidth: 1,
    fillStyle: null,
});
__decorate([
    ScenePathChangeDetection()
], Arc.prototype, "centerX", void 0);
__decorate([
    ScenePathChangeDetection()
], Arc.prototype, "centerY", void 0);
__decorate([
    ScenePathChangeDetection()
], Arc.prototype, "radius", void 0);
__decorate([
    ScenePathChangeDetection()
], Arc.prototype, "startAngle", void 0);
__decorate([
    ScenePathChangeDetection()
], Arc.prototype, "endAngle", void 0);
__decorate([
    ScenePathChangeDetection()
], Arc.prototype, "counterClockwise", void 0);
__decorate([
    ScenePathChangeDetection()
], Arc.prototype, "type", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3NoYXBlL2FyYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDeEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMvQixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsSUFBSyxPQUlKO0FBSkQsV0FBSyxPQUFPO0lBQ1IscUNBQUksQ0FBQTtJQUNKLHVDQUFLLENBQUE7SUFDTCx1Q0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUpJLE9BQU8sS0FBUCxPQUFPLFFBSVg7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxHQUFJLFNBQVEsSUFBSTtJQVF6QjtRQUNJLEtBQUssRUFBRSxDQUFDO1FBS1osWUFBTyxHQUFXLENBQUMsQ0FBQztRQUdwQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBR3BCLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFHcEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUd2QixhQUFRLEdBQVcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFPL0IscUJBQWdCLEdBQVksS0FBSyxDQUFDO1FBRWxDOzs7Ozs7Ozs7OztXQVdHO1FBRUgsU0FBSSxHQUFZLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUF0Q3pCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFpQkQsSUFBWSxPQUFPO1FBQ2YsT0FBTyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFvQkQsVUFBVTtRQUNOLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFFdkIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsbUVBQW1FO1FBQ2pGLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXpHLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQzdCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNwQjthQUFNLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNwQjtJQUNMLENBQUM7SUFFRCxXQUFXO1FBQ1Asa0VBQWtFO1FBQ2xFLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzlHLENBQUM7SUFFRCxhQUFhLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRWhDLE9BQU8sQ0FDSCxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxJQUFJO1lBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUM1QyxDQUFDO0lBQ04sQ0FBQzs7QUE3RU0sYUFBUyxHQUFHLEtBQUssQ0FBQztBQUVSLGlCQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFBRTtJQUNwRSxTQUFTLEVBQUUsQ0FBQztJQUNaLFNBQVMsRUFBRSxJQUFJO0NBQ2xCLENBQUMsQ0FBQztBQVFIO0lBREMsd0JBQXdCLEVBQUU7b0NBQ1A7QUFHcEI7SUFEQyx3QkFBd0IsRUFBRTtvQ0FDUDtBQUdwQjtJQURDLHdCQUF3QixFQUFFO21DQUNQO0FBR3BCO0lBREMsd0JBQXdCLEVBQUU7dUNBQ0o7QUFHdkI7SUFEQyx3QkFBd0IsRUFBRTtxQ0FDSTtBQU8vQjtJQURDLHdCQUF3QixFQUFFOzZDQUNPO0FBZWxDO0lBREMsd0JBQXdCLEVBQUU7aUNBQ0UifQ==