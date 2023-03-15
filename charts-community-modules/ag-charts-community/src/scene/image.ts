import { Node, RedrawType, SceneChangeDetection, RenderContext } from './node';

export class Image extends Node {
    private readonly sourceImage: HTMLImageElement;

    constructor(sourceImage: HTMLImageElement) {
        super();
        this.sourceImage = sourceImage;
    }

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    x: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    y: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    width: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    height: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    opacity: number = 1;

    render(renderCtx: RenderContext): void {
        const { ctx, forceRender, stats } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats) stats.nodesSkipped++;
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
