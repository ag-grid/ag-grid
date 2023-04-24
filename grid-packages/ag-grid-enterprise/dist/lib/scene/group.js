"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
var node_1 = require("./node");
var bbox_1 = require("./bbox");
var compare_1 = require("../util/compare");
var logger_1 = require("../util/logger");
var Group = /** @class */ (function (_super) {
    __extends(Group, _super);
    function Group(opts) {
        var _a;
        var _this = _super.call(this) || this;
        _this.opts = opts;
        _this.opacity = 1;
        _this.lastBBox = undefined;
        var _b = opts || {}, zIndex = _b.zIndex, zIndexSubOrder = _b.zIndexSubOrder;
        _this.isContainerNode = true;
        if (zIndex !== undefined) {
            _this.zIndex = zIndex;
        }
        if (zIndexSubOrder !== undefined) {
            _this.zIndexSubOrder = zIndexSubOrder;
        }
        _this.name = (_a = _this.opts) === null || _a === void 0 ? void 0 : _a.name;
        return _this;
    }
    Group.prototype.zIndexChanged = function () {
        var _a;
        if (this.layer) {
            (_a = this._layerManager) === null || _a === void 0 ? void 0 : _a.moveLayer(this.layer, this.zIndex, this.zIndexSubOrder);
        }
    };
    Group.prototype.isLayer = function () {
        return this.layer != null;
    };
    Group.prototype._setLayerManager = function (scene) {
        var _this = this;
        var _a;
        if (this._layerManager && this.layer) {
            this._layerManager.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.layer) {
            throw new Error('AG Charts - unable to deregister scene rendering layer!');
        }
        _super.prototype._setLayerManager.call(this, scene);
        if (scene && ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.layer)) {
            var _b = this.opts || {}, zIndex = _b.zIndex, zIndexSubOrder = _b.zIndexSubOrder, name_1 = _b.name;
            var getComputedOpacity = function () { return _this.getComputedOpacity(); };
            var getVisibility = function () { return _this.getVisibility(); };
            this.layer = scene.addLayer({ zIndex: zIndex, zIndexSubOrder: zIndexSubOrder, name: name_1, getComputedOpacity: getComputedOpacity, getVisibility: getVisibility });
        }
    };
    Group.prototype.getComputedOpacity = function () {
        var opacity = 1;
        var node = this;
        do {
            if (node instanceof Group) {
                opacity *= node.opacity;
            }
        } while ((node = node.parent));
        return opacity;
    };
    Group.prototype.getVisibility = function () {
        var node = this;
        var visible = this.visible;
        while ((node = node.parent)) {
            if (node.visible) {
                continue;
            }
            visible = node.visible;
        }
        return visible;
    };
    Group.prototype.visibilityChanged = function () {
        if (this.layer) {
            this.layer.enabled = this.visible;
        }
    };
    Group.prototype.markDirty = function (source, type) {
        if (type === void 0) { type = node_1.RedrawType.TRIVIAL; }
        var parentType = type <= node_1.RedrawType.MINOR ? node_1.RedrawType.TRIVIAL : type;
        _super.prototype.markDirty.call(this, source, type, parentType);
    };
    // We consider a group to be boundless, thus any point belongs to it.
    Group.prototype.containsPoint = function (_x, _y) {
        return true;
    };
    Group.prototype.computeBBox = function () {
        this.computeTransformMatrix();
        return Group.computeBBox(this.children);
    };
    Group.prototype.computeTransformedBBox = function () {
        return this.computeBBox();
    };
    Group.prototype.render = function (renderCtx) {
        var e_1, _a;
        var _b, _c;
        var _d = this.opts, _e = (_d === void 0 ? {} : _d).name, name = _e === void 0 ? undefined : _e;
        var _f = this._debug, _g = (_f === void 0 ? {} : _f).consoleLog, consoleLog = _g === void 0 ? false : _g;
        var _h = this, dirty = _h.dirty, dirtyZIndex = _h.dirtyZIndex, layer = _h.layer, children = _h.children, clipRect = _h.clipRect;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, clipBBox = renderCtx.clipBBox;
        var resized = renderCtx.resized, stats = renderCtx.stats;
        var canvasCtxTransform = ctx.getTransform();
        var isDirty = dirty >= node_1.RedrawType.MINOR || dirtyZIndex || resized;
        var isChildDirty = isDirty || children.some(function (n) { return n.dirty >= node_1.RedrawType.TRIVIAL; });
        if (name && consoleLog) {
            logger_1.Logger.debug({ name: name, group: this, isDirty: isDirty, isChildDirty: isChildDirty, renderCtx: renderCtx, forceRender: forceRender });
        }
        if (layer) {
            // If bounding-box of a layer changes, force re-render.
            var currentBBox = this.computeBBox();
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
                var counts = this.nodeCount;
                logger_1.Logger.debug({ name: name, result: 'skipping', renderCtx: renderCtx, counts: counts, group: this });
            }
            if (layer && stats) {
                stats.layersSkipped++;
                stats.nodesSkipped += this.nodeCount.count;
            }
            this.markClean({ recursive: false });
            // Nothing to do.
            return;
        }
        var groupVisible = this.visible;
        if (layer) {
            // Switch context to the canvas layer we use for this group.
            ctx = layer.context;
            ctx.save();
            ctx.resetTransform();
            forceRender = true;
            layer.clear();
            if (clipBBox) {
                // clipBBox is in the canvas coordinate space, when we hit a layer we apply the new clipping at which point there are no transforms in play
                var width = clipBBox.width, height = clipBBox.height, x = clipBBox.x, y = clipBBox.y;
                if (consoleLog) {
                    logger_1.Logger.debug({ name: name, clipBBox: clipBBox, ctxTransform: ctx.getTransform(), renderCtx: renderCtx, group: this });
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
            var x = clipRect.x, y = clipRect.y, width = clipRect.width, height = clipRect.height;
            ctx.save();
            if (consoleLog) {
                logger_1.Logger.debug({ name: name, clipRect: clipRect, ctxTransform: ctx.getTransform(), renderCtx: renderCtx, group: this });
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
        var renderContextChanged = forceRender !== renderCtx.forceRender || clipBBox !== renderCtx.clipBBox || ctx !== renderCtx.ctx;
        var childRenderContext = renderContextChanged ? __assign(__assign({}, renderCtx), { ctx: ctx, forceRender: forceRender, clipBBox: clipBBox }) : renderCtx;
        // Render visible children.
        var skipped = 0;
        try {
            for (var children_1 = __values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                var child = children_1_1.value;
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
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (stats)
            stats.nodesSkipped += skipped;
        // Render marks this node as clean - no need to explicitly markClean().
        _super.prototype.render.call(this, renderCtx);
        if (clipRect) {
            ctx.restore();
        }
        if (layer) {
            if (stats)
                stats.layersRendered++;
            ctx.restore();
            layer.snapshot();
            // Check for save/restore depth of zero!
            (_c = (_b = layer.context).verifyDepthZero) === null || _c === void 0 ? void 0 : _c.call(_b);
        }
        if (name && consoleLog && stats) {
            var counts = this.nodeCount;
            logger_1.Logger.debug({ name: name, result: 'rendered', skipped: skipped, renderCtx: renderCtx, counts: counts, group: this });
        }
    };
    Group.prototype.sortChildren = function () {
        this.dirtyZIndex = false;
        this.children.sort(function (a, b) {
            var _a, _b;
            return compare_1.compoundAscending(__spread([a.zIndex], ((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]), [a.serialNumber]), __spread([b.zIndex], ((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]), [b.serialNumber]), compare_1.ascendingStringNumberUndefined);
        });
    };
    Group.prototype.clipCtx = function (ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.clip();
    };
    Group.computeBBox = function (nodes) {
        var left = Infinity;
        var right = -Infinity;
        var top = Infinity;
        var bottom = -Infinity;
        nodes.forEach(function (n) {
            if (!n.visible) {
                return;
            }
            var bbox = n.computeTransformedBBox();
            if (!bbox) {
                return;
            }
            var x = bbox.x;
            var y = bbox.y;
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
    };
    /**
     * Transforms bbox given in the canvas coordinate space to bbox in this group's coordinate space and
     * sets this group's clipRect to the transformed bbox.
     * @param bbox clipRect bbox in the canvas coordinate space.
     */
    Group.prototype.setClipRectInGroupCoordinateSpace = function (bbox) {
        this.clipRect = bbox ? this.transformBBox(bbox) : undefined;
    };
    Group.className = 'Group';
    __decorate([
        node_1.SceneChangeDetection({
            convertor: function (v) { return Math.min(1, Math.max(0, v)); },
        })
    ], Group.prototype, "opacity", void 0);
    return Group;
}(node_1.Node));
exports.Group = Group;
//# sourceMappingURL=group.js.map