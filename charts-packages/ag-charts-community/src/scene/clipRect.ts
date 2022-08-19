import { Node, RedrawType, SceneChangeDetection, RenderContext } from './node';
import { Path2D } from './path2D';
import { BBox } from './bbox';
import { ScenePathChangeDetection } from './shape/path';

/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
export class ClipRect extends Node {
    static className = 'ClipRect';

    protected path = new Path2D();

    constructor() {
        super();

        this.isContainerNode = true;
    }

    containsPoint(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        return (
            point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height
        );
    }

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    enabled: boolean = true;

    private _dirtyPath = true;

    @ScenePathChangeDetection()
    x: number = 0;

    @ScenePathChangeDetection()
    y: number = 0;

    @ScenePathChangeDetection()
    width: number = 10;

    @ScenePathChangeDetection()
    height: number = 10;

    updatePath() {
        const { x, y, width, height, path } = this;

        path.clear();
        path.rect(x, y, width, height);

        this._dirtyPath = false;
    }

    computeBBox(): BBox {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }

    preChildRender(renderCtx: RenderContext) {
        const { enabled, _dirtyPath } = this;
        let { ctx } = renderCtx;

        if (_dirtyPath) {
            this.updatePath();
        }

        if (enabled) {
            ctx.save();
            this.path.draw(ctx);
            ctx.clip();
        }

        const clipBBox = enabled ? this.computeBBox() : undefined;
        return { ...renderCtx, clipBBox };
    }

    postChildRender(renderCtx: RenderContext) {
        const { enabled } = this;
        let { ctx } = renderCtx;

        if (enabled) {
            ctx.restore();
        }
    }
}
