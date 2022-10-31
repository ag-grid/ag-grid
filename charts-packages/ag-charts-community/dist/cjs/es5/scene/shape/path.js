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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var shape_1 = require("./shape");
var path2D_1 = require("../path2D");
var node_1 = require("../node");
function ScenePathChangeDetection(opts) {
    var _a = opts || {}, _b = _a.redraw, redraw = _b === void 0 ? node_1.RedrawType.MAJOR : _b, changeCb = _a.changeCb, convertor = _a.convertor;
    return node_1.SceneChangeDetection({ redraw: redraw, type: 'path', convertor: convertor, changeCb: changeCb });
}
exports.ScenePathChangeDetection = ScenePathChangeDetection;
var Path = /** @class */ (function (_super) {
    __extends(Path, _super);
    function Path(renderOverride) {
        var _this = _super.call(this) || this;
        _this.renderOverride = renderOverride;
        /**
         * Declare a path to retain for later rendering and hit testing
         * using custom Path2D class. Think of it as a TypeScript version
         * of the native Path2D (with some differences) that works in all browsers.
         */
        _this.path = new path2D_1.Path2D();
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
                    this.markDirty(this, node_1.RedrawType.MAJOR);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Path.prototype.checkPathDirty = function () {
        var _a, _b;
        if (this._dirtyPath) {
            return;
        }
        this.dirtyPath = this.path.isDirty() || (_b = (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.isDirty(), (_b !== null && _b !== void 0 ? _b : false));
    };
    Path.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    };
    Path.prototype.isDirtyPath = function () {
        // Override point for more expensive dirty checks.
    };
    Path.prototype.updatePath = function () {
        // Override point for subclasses.
    };
    Path.prototype.render = function (renderCtx) {
        var _a, _b;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === node_1.RedrawType.NONE && !forceRender) {
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
                var _c = (_a = this.computeBBox(), (_a !== null && _a !== void 0 ? _a : {})), _d = _c.x, x = _d === void 0 ? -10000 : _d, _e = _c.y, y = _e === void 0 ? -10000 : _e, _f = _c.width, width = _f === void 0 ? 20000 : _f, _g = _c.height, height = _g === void 0 ? 20000 : _g;
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
}(shape_1.Shape));
exports.Path = Path;
