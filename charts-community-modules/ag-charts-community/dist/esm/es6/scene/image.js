var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Node, RedrawType, SceneChangeDetection } from './node';
export class Image extends Node {
    constructor(sourceImage) {
        super();
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.opacity = 1;
        this.sourceImage = sourceImage;
    }
    render(renderCtx) {
        const { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        const image = this.sourceImage;
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(image, 0, 0, image.width, image.height, this.x, this.y, this.width, this.height);
        super.render(renderCtx);
    }
}
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "x", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "y", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "width", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "height", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Image.prototype, "opacity", void 0);
