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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Node, RedrawType, SceneChangeDetection } from './node';
import { BBox } from './bbox';
import { compoundAscending, ascendingStringNumberUndefined } from '../util/compare';
import { Logger } from '../util/logger';
var Group = /** @class */ (function (_super) {
    __extends(Group, _super);
    function Group(opts) {
        var _a;
        var _this = _super.call(this) || this;
        _this.opts = opts;
        _this.opacity = 1;
        _this.lastBBox = undefined;
        var _b = opts !== null && opts !== void 0 ? opts : {}, zIndex = _b.zIndex, zIndexSubOrder = _b.zIndexSubOrder;
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
        var _a, _b;
        if (this._layerManager && this.layer) {
            this._layerManager.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.layer) {
            throw new Error('AG Charts - unable to deregister scene rendering layer!');
        }
        _super.prototype._setLayerManager.call(this, scene);
        if (scene && ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.layer)) {
            var _c = (_b = this.opts) !== null && _b !== void 0 ? _b : {}, zIndex = _c.zIndex, zIndexSubOrder = _c.zIndexSubOrder, name_1 = _c.name;
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
        if (type === void 0) { type = RedrawType.TRIVIAL; }
        var parentType = type <= RedrawType.MINOR ? RedrawType.TRIVIAL : type;
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
        var _d = this.opts, _e = _d === void 0 ? {} : _d, _f = _e.name, name = _f === void 0 ? undefined : _f;
        var _g = this._debug, _h = _g === void 0 ? {} : _g, _j = _h.consoleLog, consoleLog = _j === void 0 ? false : _j;
        var _k = this, dirty = _k.dirty, dirtyZIndex = _k.dirtyZIndex, layer = _k.layer, children = _k.children, clipRect = _k.clipRect;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, clipBBox = renderCtx.clipBBox;
        var resized = renderCtx.resized, stats = renderCtx.stats;
        var canvasCtxTransform = ctx.getTransform();
        var isDirty = dirty >= RedrawType.MINOR || dirtyZIndex || resized;
        var isChildDirty = isDirty || children.some(function (n) { return n.dirty >= RedrawType.TRIVIAL; });
        if (name && consoleLog) {
            Logger.debug({ name: name, group: this, isDirty: isDirty, isChildDirty: isChildDirty, renderCtx: renderCtx, forceRender: forceRender });
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
                Logger.debug({ name: name, result: 'skipping', renderCtx: renderCtx, counts: counts, group: this });
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
                    Logger.debug({ name: name, clipBBox: clipBBox, ctxTransform: ctx.getTransform(), renderCtx: renderCtx, group: this });
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
                Logger.debug({ name: name, clipRect: clipRect, ctxTransform: ctx.getTransform(), renderCtx: renderCtx, group: this });
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
            Logger.debug({ name: name, result: 'rendered', skipped: skipped, renderCtx: renderCtx, counts: counts, group: this });
        }
    };
    Group.prototype.sortChildren = function () {
        this.dirtyZIndex = false;
        this.children.sort(function (a, b) {
            var _a, _b;
            return compoundAscending(__spreadArray(__spreadArray([a.zIndex], __read(((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]))), [a.serialNumber]), __spreadArray(__spreadArray([b.zIndex], __read(((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]))), [b.serialNumber]), ascendingStringNumberUndefined);
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
        return new BBox(left, top, right - left, bottom - top);
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
        SceneChangeDetection({
            convertor: function (v) { return Math.min(1, Math.max(0, v)); },
        })
    ], Group.prototype, "opacity", void 0);
    return Group;
}(Node));
export { Group };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUErQyxNQUFNLFFBQVEsQ0FBQztBQUM3RyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRzlCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSw4QkFBOEIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUl4QztJQUEyQix5QkFBSTtJQXNCM0IsZUFDdUIsSUFLbEI7O1FBTkwsWUFRSSxpQkFBTyxTQVlWO1FBbkJzQixVQUFJLEdBQUosSUFBSSxDQUt0QjtRQWxCTCxhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBdUdaLGNBQVEsR0FBVSxTQUFTLENBQUM7UUFqRjFCLElBQUEsS0FBNkIsSUFBSSxhQUFKLElBQUksY0FBSixJQUFJLEdBQUksRUFBRSxFQUFyQyxNQUFNLFlBQUEsRUFBRSxjQUFjLG9CQUFlLENBQUM7UUFFOUMsS0FBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3RCLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO1lBQzlCLEtBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1NBQ3hDO1FBQ0QsS0FBSSxDQUFDLElBQUksR0FBRyxNQUFBLEtBQUksQ0FBQyxJQUFJLDBDQUFFLElBQUksQ0FBQzs7SUFDaEMsQ0FBQztJQTlCUyw2QkFBYSxHQUF2Qjs7UUFDSSxJQUFJLElBQUks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