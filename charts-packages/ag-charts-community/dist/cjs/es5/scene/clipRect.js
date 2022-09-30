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
var path2D_1 = require("./path2D");
var bbox_1 = require("./bbox");
var path_1 = require("./shape/path");
/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
var ClipRect = /** @class */ (function (_super) {
    __extends(ClipRect, _super);
    function ClipRect() {
        var _this = _super.call(this) || this;
        _this.path = new path2D_1.Path2D();
        _this.enabled = true;
        _this._dirtyPath = true;
        _this.x = 0;
        _this.y = 0;
        _this.width = 10;
        _this.height = 10;
        _this.isContainerNode = true;
        return _this;
    }
    ClipRect.prototype.containsPoint = function (x, y) {
        var point = this.transformPoint(x, y);
        return (point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height);
    };
    ClipRect.prototype.updatePath = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height, path = _a.path;
        path.clear();
        path.rect(x, y, width, height);
        this._dirtyPath = false;
    };
    ClipRect.prototype.computeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return new bbox_1.BBox(x, y, width, height);
    };
    ClipRect.prototype.render = function (renderCtx) {
        var e_1, _a;
        var _b = this, enabled = _b.enabled, dirty = _b.dirty, _dirtyPath = _b._dirtyPath, children = _b.children;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (dirty === node_1.RedrawType.NONE && !forceRender) {
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
        var clipBBox = enabled ? this.computeBBox() : undefined;
        var childRenderContext = __assign(__assign({}, renderCtx), { clipBBox: clipBBox });
        try {
            for (var children_1 = __values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                var child = children_1_1.value;
                if (child.visible && (forceRender || child.dirty > node_1.RedrawType.NONE)) {
                    ctx.save();
                    child.render(childRenderContext);
                    ctx.restore();
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        _super.prototype.render.call(this, renderCtx);
        if (enabled) {
            ctx.restore();
        }
    };
    ClipRect.className = 'ClipRect';
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], ClipRect.prototype, "enabled", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], ClipRect.prototype, "x", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], ClipRect.prototype, "y", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], ClipRect.prototype, "width", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], ClipRect.prototype, "height", void 0);
    return ClipRect;
}(node_1.Node));
exports.ClipRect = ClipRect;
