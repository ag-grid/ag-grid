var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Node, RedrawType, SceneChangeDetection } from './node';
import { BBox } from './bbox';
import { Path2D } from './path2D';
import { compoundAscending, ascendingStringNumberUndefined } from '../util/compare';
export class Group extends Node {
    constructor(opts) {
        var _a;
        super();
        this.opts = opts;
        this.clipPath = new Path2D();
        this.opacity = 1;
        this.lastBBox = undefined;
        const { zIndex, zIndexSubOrder } = opts || {};
        this.isContainerNode = true;
        if (zIndex !== undefined) {
            this.zIndex = zIndex;
        }
        if (zIndexSubOrder !== undefined) {
            this.zIndexSubOrder = zIndexSubOrder;
        }
        this.name = (_a = this.opts) === null || _a === void 0 ? void 0 : _a.name;
    }
    zIndexChanged() {
        var _a;
        if (this.layer) {
            (_a = this._scene) === null || _a === void 0 ? void 0 : _a.moveLayer(this.layer, this.zIndex, this.zIndexSubOrder);
        }
    }
    isLayer() {
        return this.layer != null;
    }
    _setScene(scene) {
        var _a;
        if (this._scene && this.layer) {
            this._scene.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.layer) {
            throw new Error('AG Charts - unable to deregister scene rendering layer!');
        }
        super._setScene(scene);
        if (scene && ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.layer)) {
            const { zIndex, zIndexSubOrder, name } = this.opts || {};
            const getComputedOpacity = () => this.getComputedOpacity();
            const getVisibility = () => this.getVisibility();
            this.layer = scene.addLayer({ zIndex, zIndexSubOrder, name, getComputedOpacity, getVisibility });
        }
    }
    getComputedOpacity() {
        let opacity = 1;
        let node = this;
        do {
            if (node instanceof Group) {
                opacity *= node.opacity;
            }
        } while ((node = node.parent));
        return opacity;
    }
    getVisibility() {
        let node = this;
        let visible = this.visible;
        while ((node = node.parent)) {
            if (node.visible) {
                continue;
            }
            visible = node.visible;
        }
        return visible;
    }
    visibilityChanged() {
        if (this.layer) {
            this.layer.enabled = this.visible;
        }
    }
    markDirty(source, type = RedrawType.TRIVIAL) {
        const parentType = type <= RedrawType.MINOR ? RedrawType.TRIVIAL : type;
        super.markDirty(source, type, parentType);
    }
    // We consider a group to be boundless, thus any point belongs to it.
    containsPoint(_x, _y) {
        return true;
    }
    computeBBox() {
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        this.computeTransformMatrix();
        this.children.forEach((child) => {
            if (!child.visible) {
                return;
            }
            const bbox = child.computeTransformedBBox();
            if (!bbox) {
                return;
            }
            const x = bbox.x;
            const y = bbox.y;
            if (x < left) {
                left = x;
            }
            if (y < top) {
                top = y;
            }
            if (x + bbox.width > right) {
                right = x + bbox.width;
            }
            if (y + bbox.height > bottom) {
                bottom = y + bbox.height;
            }
        });
        return new BBox(left, top, right - left, bottom - top);
    }
    computeTransformedBBox() {
        return this.computeBBox();
    }
    render(renderCtx) {
        const { opts: { name = undefined } = {} } = this;
        const { _debug: { consoleLog = false } = {} } = this;
        const { dirty, dirtyZIndex, clipPath, layer, children } = this;
        let { ctx, forceRender, clipBBox, resized, stats } = renderCtx;
        const isDirty = dirty >= RedrawType.MINOR || dirtyZIndex || resized;
        const isChildDirty = isDirty || children.some((n) => n.dirty >= RedrawType.TRIVIAL);
        if (name && consoleLog) {
            console.log({ name, group: this, isDirty, isChildDirty, renderCtx, forceRender });
        }
        if (layer) {
            // If bounding-box of a layer changes, force re-render.
            const currentBBox = this.computeBBox();
            if (this.lastBBox === undefined || !this.lastBBox.equals(currentBBox)) {
                forceRender = true;
                this.lastBBox = currentBBox;
            }
            else if (!currentBBox.isInfinite()) {
                // bbox for path2D is currently (Infinity) not calculated
                // If it's not a path2D, turn off forceRender
                // By default there is no need to force redraw a group which has it's own canvas layer
                // as the layer is independent of any other layer
                forceRender = false;
            }
        }
        if (!isDirty && !isChildDirty && !forceRender) {
            if (name && consoleLog && stats) {
                const counts = this.nodeCount;
                console.log({ name, result: 'skipping', renderCtx, counts, group: this });
            }
            if (layer && stats) {
                stats.layersSkipped++;
                stats.nodesSkipped += this.nodeCount.count;
            }
            this.markClean({ recursive: false });
            // Nothing to do.
            return;
        }
        let groupVisible = this.visible;
        if (layer) {
            // Switch context to the canvas layer we use for this group.
            ctx = layer.context;
            ctx.save();
            ctx.setTransform(renderCtx.ctx.getTransform());
            forceRender = true;
            layer.clear();
            if (clipBBox) {
                const { width, height, x, y } = clipBBox;
                if (consoleLog) {
                    console.log({ name, clipBBox, ctxTransform: ctx.getTransform(), renderCtx, group: this });
                }
                clipPath.clear();
                clipPath.rect(x, y, width, height);
                clipPath.draw(ctx);
                ctx.clip();
            }
        }
        else {
            // Only apply opacity if this isn't a distinct layer - opacity will be applied
            // at composition time.
            ctx.globalAlpha *= this.opacity;
        }
        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        clipBBox = clipBBox ? this.matrix.inverse().transformBBox(clipBBox) : undefined;
        if (dirtyZIndex) {
            this.sortChildren();
            forceRender = true;
        }
        // Reduce churn if renderCtx is identical.
        const renderContextChanged = forceRender !== renderCtx.forceRender || clipBBox !== renderCtx.clipBBox || ctx !== renderCtx.ctx;
        const childRenderContext = renderContextChanged ? Object.assign(Object.assign({}, renderCtx), { ctx, forceRender, clipBBox }) : renderCtx;
        // Render visible children.
        let skipped = 0;
        for (const child of children) {
            if (!child.visible || !groupVisible) {
                // Skip invisible children, but make sure their dirty flag is reset.
                child.markClean();
                if (stats)
                    skipped += child.nodeCount.count;
                continue;
            }
            if (!forceRender && child.dirty === RedrawType.NONE) {
                // Skip children that don't need to be redrawn.
                if (stats)
                    skipped += child.nodeCount.count;
                continue;
            }
            // Render marks this node (and children) as clean - no need to explicitly markClean().
            ctx.save();
            child.render(childRenderContext);
            ctx.restore();
        }
        if (stats)
            stats.nodesSkipped += skipped;
        // Render marks this node as clean - no need to explicitly markClean().
        super.render(renderCtx);
        if (layer) {
            if (stats)
                stats.layersRendered++;
            ctx.restore();
            layer.snapshot();
        }
        if (name && consoleLog && stats) {
            const counts = this.nodeCount;
            console.log({ name, result: 'rendered', skipped, renderCtx, counts, group: this });
        }
    }
    sortChildren() {
        this.dirtyZIndex = false;
        this.children.sort((a, b) => {
            var _a, _b;
            return compoundAscending([a.zIndex, ...((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]), a.serialNumber], [b.zIndex, ...((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]), b.serialNumber], ascendingStringNumberUndefined);
        });
    }
}
Group.className = 'Group';
__decorate([
    SceneChangeDetection({
        convertor: (v) => Math.min(1, Math.max(0, v)),
    })
], Group.prototype, "opacity", void 0);
