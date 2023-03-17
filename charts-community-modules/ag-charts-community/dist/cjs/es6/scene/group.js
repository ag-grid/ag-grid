"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const node_1 = require("./node");
const bbox_1 = require("./bbox");
const compare_1 = require("../util/compare");
const logger_1 = require("../util/logger");
class Group extends node_1.Node {
    constructor(opts) {
        var _a;
        super();
        this.opts = opts;
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
            (_a = this._layerManager) === null || _a === void 0 ? void 0 : _a.moveLayer(this.layer, this.zIndex, this.zIndexSubOrder);
        }
    }
    isLayer() {
        return this.layer != null;
    }
    _setLayerManager(scene) {
        var _a;
        if (this._layerManager && this.layer) {
            this._layerManager.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.layer) {
            throw new Error('AG Charts - unable to deregister scene rendering layer!');
        }
        super._setLayerManager(scene);
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
    markDirty(source, type = node_1.RedrawType.TRIVIAL) {
        const parentType = type <= node_1.RedrawType.MINOR ? node_1.RedrawType.TRIVIAL : type;
        super.markDirty(source, type, parentType);
    }
    // We consider a group to be boundless, thus any point belongs to it.
    containsPoint(_x, _y) {
        return true;
    }
    computeBBox() {
        this.computeTransformMatrix();
        return Group.computeBBox(this.children);
    }
    computeTransformedBBox() {
        return this.computeBBox();
    }
    render(renderCtx) {
        var _a, _b;
        const { opts: { name = undefined } = {} } = this;
        const { _debug: { consoleLog = false } = {} } = this;
        const { dirty, dirtyZIndex, layer, children, clipRect } = this;
        let { ctx, forceRender, clipBBox } = renderCtx;
        const { resized, stats } = renderCtx;
        const canvasCtxTransform = ctx.getTransform();
        const isDirty = dirty >= node_1.RedrawType.MINOR || dirtyZIndex || resized;
        const isChildDirty = isDirty || children.some((n) => n.dirty >= node_1.RedrawType.TRIVIAL);
        if (name && consoleLog) {
            logger_1.Logger.debug({ name, group: this, isDirty, isChildDirty, renderCtx, forceRender });
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
                logger_1.Logger.debug({ name, result: 'skipping', renderCtx, counts, group: this });
            }
            if (layer && stats) {
                stats.layersSkipped++;
                stats.nodesSkipped += this.nodeCount.count;
            }
            this.markClean({ recursive: false });
            // Nothing to do.
            return;
        }
        const groupVisible = this.visible;
        if (layer) {
            // Switch context to the canvas layer we use for this group.
            ctx = layer.context;
            ctx.save();
            ctx.resetTransform();
            forceRender = true;
            layer.clear();
            if (clipBBox) {
                // clipBBox is in the canvas coordinate space, when we hit a layer we apply the new clipping at which point there are no transforms in play
                const { width, height, x, y } = clipBBox;
                if (consoleLog) {
                    logger_1.Logger.debug({ name, clipBBox, ctxTransform: ctx.getTransform(), renderCtx, group: this });
                }
                this.clipCtx(ctx, x, y, width, height);
            }
            ctx.setTransform(canvasCtxTransform);
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
        if (clipRect) {
            // clipRect is in the group's coordinate space
            const { x, y, width, height } = clipRect;
            ctx.save();
            if (consoleLog) {
                logger_1.Logger.debug({ name, clipRect, ctxTransform: ctx.getTransform(), renderCtx, group: this });
            }
            this.clipCtx(ctx, x, y, width, height);
            // clipBBox is in the canvas coordinate space, when we hit a layer we apply the new clipping at which point there are no transforms in play
            clipBBox = this.matrix.inverse().transformBBox(clipRect);
        }
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
            if (!forceRender && child.dirty === node_1.RedrawType.NONE) {
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
        if (clipRect) {
            ctx.restore();
        }
        if (layer) {
            if (stats)
                stats.layersRendered++;
            ctx.restore();
            layer.snapshot();
            // Check for save/restore depth of zero!
            (_b = (_a = layer.context).verifyDepthZero) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
        if (name && consoleLog && stats) {
            const counts = this.nodeCount;
            logger_1.Logger.debug({ name, result: 'rendered', skipped, renderCtx, counts, group: this });
        }
    }
    sortChildren() {
        this.dirtyZIndex = false;
        this.children.sort((a, b) => {
            var _a, _b;
            return compare_1.compoundAscending([a.zIndex, ...((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]), a.serialNumber], [b.zIndex, ...((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]), b.serialNumber], compare_1.ascendingStringNumberUndefined);
        });
    }
    clipCtx(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.clip();
    }
    static computeBBox(nodes) {
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        nodes.forEach((n) => {
            if (!n.visible) {
                return;
            }
            const bbox = n.computeTransformedBBox();
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
        return new bbox_1.BBox(left, top, right - left, bottom - top);
    }
    /**
     * Transforms bbox given in the canvas coordinate space to bbox in this group's coordinate space and
     * sets this group's clipRect to the transformed bbox.
     * @param bbox clipRect bbox in the canvas coordinate space.
     */
    setClipRectInGroupCoordinateSpace(bbox) {
        this.clipRect = bbox ? this.transformBBox(bbox) : undefined;
    }
}
Group.className = 'Group';
__decorate([
    node_1.SceneChangeDetection({
        convertor: (v) => Math.min(1, Math.max(0, v)),
    })
], Group.prototype, "opacity", void 0);
exports.Group = Group;
