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
import { Path2D } from '../path2D';
import { RedrawType, SceneChangeDetection } from '../node';
export function ScenePathChangeDetection(opts) {
    var _a = opts !== null && opts !== void 0 ? opts : {}, _b = _a.redraw, redraw = _b === void 0 ? RedrawType.MAJOR : _b, changeCb = _a.changeCb, convertor = _a.convertor;
    return SceneChangeDetection({ redraw: redraw, type: 'path', convertor: convertor, changeCb: changeCb });
}
var Path = /** @class */ (function (_super) {
    __extends(Path, _super);
    function Path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Declare a path to retain for later rendering and hit testing
         * using custom Path2D class. Think of it as a TypeScript version
         * of the native Path2D (with some differences) that works in all browsers.
         */
        _this.path = new Path2D();
        /**
         * The path only has to be updated when certain attributes change.
         * For example, if transform attributes (such as `translationX`)
         * are changed, we don't have to update the path. The `dirtyPath` flag
         * is how we keep track if the path has to be updated or not.
         */
        _this._dirtyPath = true;
        return _this;
    }
    Object.defineProperty(Path.prototype, "dirtyPath", {
        get: function () {
            return this._dirtyPath;
        },
        set: function (value) {
            if (this._dirtyPath !== value) {
                this._dirtyPath = value;
                if (value) {
                    this.markDirty(this, RedrawType.MAJOR);
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Path.prototype.checkPathDirty = function () {
        var _a, _b;
        if (this._dirtyPath) {
            return;
        }
        this.dirtyPath = this.path.isDirty() || ((_b = (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.isDirty()) !== null && _b !== void 0 ? _b : false);
    };
    Path.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    };
    Path.prototype.isDirtyPath = function () {
        // Override point for more expensive dirty checks.
        return false;
    };
    Path.prototype.updatePath = function () {
        // Override point for subclasses.
    };
    Path.prototype.render = function (renderCtx) {
        var _a, _b;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
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
                var _c = (_a = this.computeBBox()) !== null && _a !== void 0 ? _a : {}, _d = _c.x, x = _d === void 0 ? -10000 : _d, _e = _c.y, y = _e === void 0 ? -10000 : _e, _f = _c.width, width = _f === void 0 ? 20000 : _f, _g = _c.height, height = _g === void 0 ? 20000 : _g;
                ctx.clearRect(x, y, width, height);
            }
            ctx.restore();
        }
        else {
            this.path.draw(ctx);
            this.fillStroke(ctx);
        }
        (_b = this.fillShadow) === null || _b === void 0 ? void 0 : _b.markClean();
        _super.prototype.render.call(this, renderCtx);
    };
    Path.className = 'Path';
    __decorate([
        ScenePathChangeDetection()
    ], Path.prototype, "clipPath", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Path.prototype, "clipMode", void 0);
    return Path;
}(Shape));
export { Path };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFwZS9wYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNuQyxPQUFPLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFpQixNQUFNLFNBQVMsQ0FBQztBQUUxRSxNQUFNLFVBQVUsd0JBQXdCLENBQUMsSUFJeEM7SUFDUyxJQUFBLEtBQXFELElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsRUFBN0QsY0FBeUIsRUFBekIsTUFBTSxtQkFBRyxVQUFVLENBQUMsS0FBSyxLQUFBLEVBQUUsUUFBUSxjQUFBLEVBQUUsU0FBUyxlQUFlLENBQUM7SUFFdEUsT0FBTyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sUUFBQSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxXQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsQ0FBQyxDQUFDO0FBQy9FLENBQUM7QUFFRDtJQUEwQix3QkFBSztJQUEvQjtRQUFBLHFFQXVHQztRQXBHRzs7OztXQUlHO1FBQ00sVUFBSSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFRN0I7Ozs7O1dBS0c7UUFDSyxnQkFBVSxHQUFHLElBQUksQ0FBQzs7SUFpRjlCLENBQUM7SUFoRkcsc0JBQUksMkJBQVM7YUFRYjtZQUNJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDO2FBVkQsVUFBYyxLQUFjO1lBQ3hCLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUN4QixJQUFJLEtBQUssRUFBRTtvQkFDUCxJQUFJLENBQUMsU0FBUyxD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