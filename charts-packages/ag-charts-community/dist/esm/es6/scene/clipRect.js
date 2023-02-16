var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Node, RedrawType, SceneChangeDetection } from './node';
import { Path2D } from './path2D';
import { BBox } from './bbox';
import { ScenePathChangeDetection } from './shape/path';
/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
export class ClipRect extends Node {
    constructor() {
        super();
        this.path = new Path2D();
        this.enabled = false;
        this._dirtyPath = true;
        this.x = 0;
        this.y = 0;
        this.width = 10;
        this.height = 10;
        this.isContainerNode = true;
    }
    containsPoint(x, y) {
        const point = this.transformPoint(x, y);
        return (point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height);
    }
    updatePath() {
        const { x, y, width, height, path } = this;
        path.clear();
        path.rect(x, y, width, height);
        this._dirtyPath = false;
    }
    computeBBox() {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }
    render(renderCtx) {
        const { enabled, dirty, _dirtyPath, children } = this;
        const { ctx, forceRender, stats } = renderCtx;
        if (dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        if (_dirtyPath) {
            this.updatePath();
        }
        if (enabled) {
            ctx.save();
            this.path.draw(ctx);
            ctx.clip();
        }
        const clipBBox = enabled ? this.computeBBox() : undefined;
        const childRenderContext = Object.assign(Object.assign({}, renderCtx), { clipBBox });
        for (const child of children) {
            if (child.visible && (forceRender || child.dirty > RedrawType.NONE)) {
                ctx.save();
                child.render(childRenderContext);
                ctx.restore();
            }
            else if (!child.visible) {
                child.markClean();
            }
        }
        super.render(renderCtx);
        if (enabled) {
            ctx.restore();
        }
    }
}
ClipRect.className = 'ClipRect';
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], ClipRect.prototype, "enabled", void 0);
__decorate([
    ScenePathChangeDetection()
], ClipRect.prototype, "x", void 0);
__decorate([
    ScenePathChangeDetection()
], ClipRect.prototype, "y", void 0);
__decorate([
    ScenePathChangeDetection()
], ClipRect.prototype, "width", void 0);
__decorate([
    ScenePathChangeDetection()
], ClipRect.prototype, "height", void 0);
