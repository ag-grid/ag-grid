import { Node, RedrawType, SceneChangeDetection, RenderContext } from "./node";
import { Path2D } from "./path2D";
import { BBox } from "./bbox";
import { ScenePathChangeDetection } from "./shape/path";

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
        return point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height;
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
        const path = this.path;

        path.clear();
        path.rect(this.x, this.y, this.width, this.height);

        this._dirtyPath = false;
    }

    computeBBox(): BBox {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }

    render(renderCtx: RenderContext) {
        let { ctx, forceRender } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
            return;
        }

        if (this.enabled) {
            if (this._dirtyPath) {
                this.updatePath();
            }
            this.path.draw(ctx);
            ctx.clip();
        }

        const clearNeeded = this.dirty >= RedrawType.MINOR;
        if (!forceRender && clearNeeded) {
            forceRender = true;
            this.clearBBox(ctx);
        }

        const children = this.children;
        const n = children.length;

        for (let i = 0; i < n; i++) {
            const child = children[i];
            if (child.visible && (forceRender || child.dirty > RedrawType.NONE)) {
                ctx.save();
                child.render(renderCtx);
                ctx.restore();
            }
        }

        super.render(renderCtx);
    }
}
