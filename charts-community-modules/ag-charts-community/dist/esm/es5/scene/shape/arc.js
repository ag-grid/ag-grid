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
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        var _this = _super.call(this) || this;
        _this.centerX = 0;
        _this.centerY = 0;
        _this.radius = 10;
        _this.startAngle = 0;
        _this.endAngle = Math.PI * 2;
        _this.counterClockwise = false;
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
        _this.type = ArcType.Open;
        _this.restoreOwnStyles();
        return _this;
    }
    Object.defineProperty(Arc.prototype, "fullPie", {
        get: function () {
            return isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
        },
        enumerable: false,
        configurable: true
    });
    Arc.prototype.updatePath = function () {
        var path = this.path;
        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        path.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
        if (this.type === ArcType.Chord) {
            path.closePath();
        }
        else if (this.type === ArcType.Round && !this.fullPie) {
            path.lineTo(this.centerX, this.centerY);
            path.closePath();
        }
    };
    Arc.prototype.computeBBox = function () {
        // Only works with full arcs (circles) and untransformed ellipses.
        return new BBox(this.centerX - this.radius, this.centerY - this.radius, this.radius * 2, this.radius * 2);
    };
    Arc.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return (this.type !== ArcType.Open &&
            bbox.containsPoint(point.x, point.y) &&
            this.path.isPointInPath(point.x, point.y));
    };
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
    return Arc;
}(Path));
export { Arc };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3NoYXBlL2FyYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDeEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMvQixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsSUFBSyxPQUlKO0FBSkQsV0FBSyxPQUFPO0lBQ1IscUNBQUksQ0FBQTtJQUNKLHVDQUFLLENBQUE7SUFDTCx1Q0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUpJLE9BQU8sS0FBUCxPQUFPLFFBSVg7QUFFRDs7R0FFRztBQUNIO0lBQXlCLHVCQUFJO0lBUXpCO1FBQUEsWUFDSSxpQkFBTyxTQUVWO1FBR0QsYUFBTyxHQUFXLENBQUMsQ0FBQztRQUdwQixhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBR3BCLFlBQU0sR0FBVyxFQUFFLENBQUM7UUFHcEIsZ0JBQVUsR0FBVyxDQUFDLENBQUM7UUFHdkIsY0FBUSxHQUFXLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBTy9CLHNCQUFnQixHQUFZLEtBQUssQ0FBQztRQUVsQzs7Ozs7Ozs7Ozs7V0FXRztRQUVILFVBQUksR0FBWSxPQUFPLENBQUMsSUFBSSxDQUFDO1FBdEN6QixLQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7SUFDNUIsQ0FBQztJQWlCRCxzQkFBWSx3QkFBTzthQUFuQjtZQUNJLE9BQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxpQkFBaUIs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