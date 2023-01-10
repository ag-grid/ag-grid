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
    const { redraw = RedrawType.MAJOR, changeCb, convertor } = opts || {};
    return SceneChangeDetection({ redraw, type: 'path', convertor, changeCb });
}
export class Path extends Shape {
    constructor(renderOverride) {
        super();
        this.renderOverride = renderOverride;
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
    }
    updatePath() {
        // Override point for subclasses.
    }
    render(renderCtx) {
        var _a, _b;
        let { ctx, forceRender, stats } = renderCtx;
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
            if (this.renderOverride) {
                this.renderOverride(ctx);
            }
            else {
                this.path.draw(ctx);
                this.fillStroke(ctx);
            }
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
        else if (this.renderOverride) {
            this.renderOverride(ctx);
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
