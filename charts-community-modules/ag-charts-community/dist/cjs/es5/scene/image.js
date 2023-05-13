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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
var node_1 = require("./node");
var Image = /** @class */ (function (_super) {
    __extends(Image, _super);
    function Image(sourceImage) {
        var _this = _super.call(this) || this;
        _this.x = 0;
        _this.y = 0;
        _this.width = 0;
        _this.height = 0;
        _this.opacity = 1;
        _this.sourceImage = sourceImage;
        return _this;
    }
    Image.prototype.render = function (renderCtx) {
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === node_1.RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        var image = this.sourceImage;
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(image, 0, 0, image.width, image.height, this.x, this.y, this.width, this.height);
        _super.prototype.render.call(this, renderCtx);
    };
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Image.prototype, "x", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Image.prototype, "y", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Image.prototype, "width", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Image.prototype, "height", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Image.prototype, "opacity", void 0);
    return Image;
}(node_1.Node));
exports.Image = Image;
