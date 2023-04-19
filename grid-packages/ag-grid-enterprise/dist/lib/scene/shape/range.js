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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Range = void 0;
var shape_1 = require("./shape");
var bbox_1 = require("../bbox");
var node_1 = require("../node");
var Range = /** @class */ (function (_super) {
    __extends(Range, _super);
    function Range() {
        var _this = _super.call(this) || this;
        _this.x1 = 0;
        _this.y1 = 0;
        _this.x2 = 0;
        _this.y2 = 0;
        _this.startLine = false;
        _this.endLine = false;
        _this.isRange = false;
        _this.restoreOwnStyles();
        return _this;
    }
    Range.prototype.computeBBox = function () {
        return new bbox_1.BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    };
    Range.prototype.isPointInPath = function (_x, _y) {
        return false;
    };
    Range.prototype.render = function (renderCtx) {
        var _a;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === node_1.RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        var _b = this, x1 = _b.x1, y1 = _b.y1, x2 = _b.x2, y2 = _b.y2;
        x1 = this.align(x1);
        y1 = this.align(y1);
        x2 = this.align(x2);
        y2 = this.align(y2);
        var _c = this, fill = _c.fill, opacity = _c.opacity, isRange = _c.isRange;
        var fillActive = !!(isRange && fill);
        if (fillActive) {
            var fillOpacity = this.fillOpacity;
            ctx.fillStyle = fill;
            ctx.globalAlpha = opacity * fillOpacity;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x1, y2);
            ctx.closePath();
            ctx.fill();
        }
        var _d = this, stroke = _d.stroke, strokeWidth = _d.strokeWidth, startLine = _d.startLine, endLine = _d.endLine;
        var strokeActive = !!((startLine || endLine) && stroke && strokeWidth);
        if (strokeActive) {
            var _e = this, strokeOpacity = _e.strokeOpacity, lineDash = _e.lineDash, lineDashOffset = _e.lineDashOffset, lineCap = _e.lineCap, lineJoin = _e.lineJoin;
            ctx.strokeStyle = stroke;
            ctx.globalAlpha = opacity * strokeOpacity;
            ctx.lineWidth = strokeWidth;
            if (lineDash) {
                ctx.setLineDash(lineDash);
            }
            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }
            if (lineCap) {
                ctx.lineCap = lineCap;
            }
            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }
            ctx.beginPath();
            if (startLine) {
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
            }
            if (endLine) {
                ctx.moveTo(x2, y2);
                ctx.lineTo(x1, y2);
            }
            ctx.stroke();
        }
        (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.markClean();
        _super.prototype.render.call(this, renderCtx);
    };
    Range.className = 'Range';
    Range.defaultStyles = __assign(__assign({}, shape_1.Shape.defaultStyles), { strokeWidth: 1 });
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Range.prototype, "x1", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Range.prototype, "y1", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Range.prototype, "x2", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Range.prototype, "y2", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Range.prototype, "startLine", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Range.prototype, "endLine", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Range.prototype, "isRange", void 0);
    return Range;
}(shape_1.Shape));
exports.Range = Range;
//# sourceMappingURL=range.js.map