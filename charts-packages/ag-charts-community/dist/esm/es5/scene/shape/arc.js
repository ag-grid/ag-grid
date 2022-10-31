var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { chainObjects } from '../../util/object';
import { isEqual } from '../../util/number';
export var ArcType;
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
        _this.radiusX = 10;
        _this.radiusY = 10;
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
        enumerable: true,
        configurable: true
    });
    Arc.prototype.updatePath = function () {
        var path = this.path;
        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, this.startAngle, this.endAngle, this.counterClockwise ? 1 : 0);
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
        return new BBox(this.centerX - this.radiusX, this.centerY - this.radiusY, this.radiusX * 2, this.radiusY * 2);
    };
    Arc.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return (this.type !== ArcType.Open &&
            bbox.containsPoint(point.x, point.y) &&
            this.path.isPointInPath(point.x, point.y));
    };
    Arc.className = 'Arc';
    Arc.defaultStyles = chainObjects(Shape.defaultStyles, {
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
    ], Arc.prototype, "radiusX", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Arc.prototype, "radiusY", void 0);
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
