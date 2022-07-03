"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./node");
var bbox_1 = require("./bbox");
var matrix_1 = require("./matrix");
var path2D_1 = require("./path2D");
var Group = /** @class */ (function (_super) {
    __extends(Group, _super);
    function Group(opts) {
        var _a, _b, _c;
        var _this = _super.call(this) || this;
        _this.opts = opts;
        _this.clipPath = new path2D_1.Path2D();
        _this.opacity = 1;
        _this.isContainerNode = true;
        if (((_a = _this.opts) === null || _a === void 0 ? void 0 : _a.zIndex) !== undefined) {
            _this.zIndex = _this.opts.zIndex;
        }
        if ((_b = _this.opts) === null || _b === void 0 ? void 0 : _b.optimiseDirtyTracking) {
            _this.visibleChildren = {};
            _this.dirtyChildren = {};
        }
        _this.name = (_c = _this.opts) === null || _c === void 0 ? void 0 : _c.name;
        return _this;
    }
    Group.prototype.opacityChanged = function () {
        if (this.layer) {
            this.layer.opacity = this.opacity;
        }
    };
    Group.prototype.zIndexChanged = function () {
        var _a;
        if (this.layer) {
            (_a = this._scene) === null || _a === void 0 ? void 0 : _a.moveLayer(this.layer, this.zIndex);
        }
    };
    Group.prototype.append = function (nodes) {
        var e_1, _a;
        _super.prototype.append.call(this, nodes);
        if (this.dirtyChildren) {
            nodes = nodes instanceof Array ? nodes : [nodes];
            try {
                for (var nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                    var node = nodes_1_1.value;
                    this.dirtyChildren[node.id] = node;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    Group.prototype._setScene = function (scene) {
        var _a;
        if (this._scene && this.layer) {
            this._scene.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.layer) {
            throw new Error('AG Charts - unable to deregister scene rendering layer!');
        }
        _super.prototype._setScene.call(this, scene);
        if (scene && ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.layer)) {
            var _b = this.opts || {}, zIndex = _b.zIndex, name_1 = _b.name;
            this.layer = scene.addLayer({ zIndex: zIndex, name: name_1 });
        }
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
        if (source !== this && this.dirtyChildren) {
            this.dirtyChildren[source.id] = source;
        }
    };
    Group.prototype.markClean = function (opts) {
        var e_2, _a;
        // Ensure we update visibility tracking before blowing away dirty flags.
        this.syncChildVisibility();
        var _b = this.dirtyChildren, dirtyChildren = _b === void 0 ? {} : _b;
        try {
            for (var _c = __values(Object.keys(dirtyChildren)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var key = _d.value;
                delete dirtyChildren[key];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        _super.prototype.markClean.call(this, opts);
    };
    // We consider a group to be boundless, thus any point belongs to it.
    Group.prototype.containsPoint = function (_x, _y) {
        return true;
    };
    Group.prototype.computeBBox = function () {
        var left = Infinity;
        var right = -Infinity;
        var top = Infinity;
        var bottom = -Infinity;
        this.computeTransformMatrix();
        this.children.forEach(function (child) {
            if (!child.visible) {
                return;
            }
            var bbox = child.computeBBox();
            if (!bbox) {
                return;
            }
            if (!(child instanceof Group)) {
                child.computeTransformMatrix();
                var matrix = matrix_1.Matrix.flyweight(child.matrix);
                var parent_1 = child.parent;
                while (parent_1) {
                    matrix.preMultiplySelf(parent_1.matrix);
                    parent_1 = parent_1.parent;
                }
                matrix.transformBBox(bbox, 0, bbox);
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
    Group.prototype.render = function (renderCtx) {
        var _a;
        if (this.layer && ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.optimiseDirtyTracking)) {
            this.optimisedRender(renderCtx);
            return;
        }
        this.basicRender(renderCtx);
    };
    Group.prototype.basicRender = function (renderCtx) {
        var e_3, _a;
        var _b = this.opts, _c = (_b === void 0 ? {} : _b).name, name = _c === void 0 ? undefined : _c;
        var _d = this._debug, _e = (_d === void 0 ? {} : _d).consoleLog, consoleLog = _e === void 0 ? false : _e;
        var _f = this, dirty = _f.dirty, dirtyZIndex = _f.dirtyZIndex, clipPath = _f.clipPath, layer = _f.layer, children = _f.children;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, clipBBox = renderCtx.clipBBox, resized = renderCtx.resized, stats = renderCtx.stats;
        var isDirty = dirty >= node_1.RedrawType.MINOR || dirtyZIndex || resized;
        var isChildDirty = isDirty || children.some(function (n) { return n.dirty >= node_1.RedrawType.TRIVIAL; });
        if (name && consoleLog) {
            console.log({ name: name, group: this, isDirty: isDirty, isChildDirty: isChildDirty, renderCtx: renderCtx, forceRender: forceRender });
        }
        if (layer) {
            // By default there is no need to force redraw a group which has it's own canvas layer
            // as the layer is independent of any other layer.
            forceRender = false;
        }
        if (!isDirty && !isChildDirty && !forceRender) {
            if (name && consoleLog && stats) {
                var counts = this.nodeCount;
                console.log({ name: name, result: 'skipping', renderCtx: renderCtx, counts: counts, group: this });
            }
            if (layer && stats) {
                stats.layersSkipped++;
                stats.nodesSkipped += this.nodeCount.count;
            }
            _super.prototype.markClean.call(this, { recursive: false });
            // Nothing to do.
            return;
        }
        var groupVisible = this.visible;
        if (layer) {
            // Switch context to the canvas layer we use for this group.
            ctx = layer.context;
            ctx.save();
            ctx.setTransform(renderCtx.ctx.getTransform());
            forceRender = true;
            layer.clear();
            if (clipBBox) {
                var width = clipBBox.width, height = clipBBox.height, x = clipBBox.x, y = clipBBox.y;
                if (consoleLog) {
                    console.log({ name: name, clipBBox: clipBBox, ctxTransform: ctx.getTransform(), renderCtx: renderCtx, group: this });
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
        var renderContextChanged = forceRender !== renderCtx.forceRender ||
            clipBBox !== renderCtx.clipBBox ||
            ctx !== renderCtx.ctx;
        var childRenderContext = renderContextChanged ? __assign(__assign({}, renderCtx), { ctx: ctx, forceRender: forceRender, clipBBox: clipBBox }) :
            renderCtx;
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
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (stats)
            stats.nodesSkipped += skipped;
        // Render marks this node as clean - no need to explicitly markClean().
        _super.prototype.render.call(this, renderCtx);
        if (layer) {
            if (stats)
                stats.layersRendered++;
            ctx.restore();
            layer.snapshot();
        }
        if (name && consoleLog && stats) {
            var counts = this.nodeCount;
            console.log({ name: name, result: 'rendered', skipped: skipped, renderCtx: renderCtx, counts: counts, group: this });
        }
    };
    Group.prototype.optimisedRender = function (renderCtx) {
        var e_4, _a, e_5, _b;
        var _c = this._debug, _d = (_c === void 0 ? {} : _c).consoleLog, consoleLog = _d === void 0 ? false : _d;
        var _e = this, name = _e.name, dirty = _e.dirty, dirtyZIndex = _e.dirtyZIndex, clipPath = _e.clipPath, layer = _e.layer, children = _e.children, _f = _e.dirtyChildren, dirtyChildren = _f === void 0 ? {} : _f, _g = _e.visibleChildren, visibleChildren = _g === void 0 ? {} : _g, groupVisible = _e.visible;
        var ctx = renderCtx.ctx, clipBBox = renderCtx.clipBBox, resized = renderCtx.resized, stats = renderCtx.stats;
        if (!layer) {
            return;
        }
        var isDirty = dirty >= node_1.RedrawType.MINOR || dirtyZIndex || resized;
        var isChildDirty = Object.keys(dirtyChildren).length > 0;
        if (name && consoleLog) {
            console.log({ name: name, group: this, isDirty: isDirty, isChildDirty: isChildDirty, renderCtx: renderCtx });
        }
        // By default there is no need to force redraw a group which has it's own canvas layer
        // as the layer is independent of any other layer.
        var forceRender = false;
        if (!isDirty && !isChildDirty) {
            if (name && consoleLog && stats) {
                var counts = this.nodeCount;
                console.log({ name: name, result: 'skipping', renderCtx: renderCtx, counts: counts, group: this });
            }
            if (stats) {
                stats.layersSkipped++;
                stats.nodesSkipped += this.nodeCount.count;
            }
            _super.prototype.markClean.call(this, { recursive: false });
            // Nothing to do.
            return;
        }
        // Switch context to the canvas layer we use for this group.
        ctx = layer.context;
        ctx.save();
        ctx.setTransform(renderCtx.ctx.getTransform());
        forceRender = true;
        layer.clear();
        if (clipBBox) {
            var width = clipBBox.width, height = clipBBox.height, x = clipBBox.x, y = clipBBox.y;
            if (consoleLog) {
                console.log({ name: name, clipBBox: clipBBox, ctxTransform: ctx.getTransform(), renderCtx: renderCtx, group: this });
            }
            clipPath.clear();
            clipPath.rect(x, y, width, height);
            clipPath.draw(ctx);
            ctx.clip();
        }
        this.syncChildVisibility();
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
        var renderContextChanged = forceRender !== renderCtx.forceRender ||
            clipBBox !== renderCtx.clipBBox ||
            ctx !== renderCtx.ctx;
        var childRenderContext = renderContextChanged ? __assign(__assign({}, renderCtx), { ctx: ctx, forceRender: forceRender, clipBBox: clipBBox }) :
            renderCtx;
        if (consoleLog) {
            console.log({ name: name, visibleChildren: visibleChildren, dirtyChildren: dirtyChildren });
        }
        var skipped = 0;
        if (groupVisible) {
            try {
                for (var _h = __values(Object.values(visibleChildren)), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var child = _j.value;
                    if (!forceRender && child.dirty === node_1.RedrawType.NONE) {
                        // Skip children that don't need to be redrawn.
                        if (stats)
                            skipped += child.nodeCount.count;
                        continue;
                    }
                    ctx.save();
                    child.render(childRenderContext);
                    ctx.restore();
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_a = _h.return)) _a.call(_h);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        this.markClean({ recursive: false });
        try {
            for (var _k = __values(Object.values(dirtyChildren)), _l = _k.next(); !_l.done; _l = _k.next()) {
                var child = _l.value;
                child.markClean();
                delete dirtyChildren[child.id];
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_l && !_l.done && (_b = _k.return)) _b.call(_k);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (stats)
            stats.nodesSkipped += skipped;
        if (stats)
            stats.layersRendered++;
        ctx.restore();
        layer.snapshot();
        if (name && consoleLog && stats) {
            var counts = this.nodeCount;
            console.log({ name: name, result: 'rendered', skipped: skipped, renderCtx: renderCtx, counts: counts, group: this });
        }
    };
    Group.prototype.syncChildVisibility = function () {
        var e_6, _a;
        var _b = this, dirtyChildren = _b.dirtyChildren, visibleChildren = _b.visibleChildren;
        if (!dirtyChildren || !visibleChildren) {
            return;
        }
        try {
            for (var _c = __values(Object.values(dirtyChildren)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var child = _d.value;
                if (!child.visible && visibleChildren[child.id]) {
                    delete visibleChildren[child.id];
                }
                else if (child.visible && !visibleChildren[child.id]) {
                    visibleChildren[child.id] = child;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    Group.prototype.sortChildren = function () {
        this.dirtyZIndex = false;
        this.children.sort(function (a, b) {
            var result = a.zIndex - b.zIndex;
            if (result !== 0) {
                return result;
            }
            return a.id < b.id ? -1 :
                a.id > b.id ? 1 :
                    0;
        });
    };
    Group.className = 'Group';
    __decorate([
        node_1.SceneChangeDetection({
            convertor: function (v) { return Math.min(1, Math.max(0, v)); },
            changeCb: function (o) { return o.opacityChanged(); },
        })
    ], Group.prototype, "opacity", void 0);
    return Group;
}(node_1.Node));
exports.Group = Group;
//# sourceMappingURL=group.js.map