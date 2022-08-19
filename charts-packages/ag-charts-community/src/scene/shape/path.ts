import { Shape } from './shape';
import { Path2D } from '../path2D';
import { RedrawType, SceneChangeDetection, RenderContext } from '../node';

export function ScenePathChangeDetection(opts?: {
    redraw?: RedrawType;
    convertor?: (o: any) => any;
    changeCb?: (t: any) => any;
}) {
    const { redraw = RedrawType.MAJOR, changeCb, convertor } = opts || {};

    return SceneChangeDetection({ redraw, type: 'path', convertor, changeCb });
}

export class Path extends Shape {
    static className = 'Path';

    /**
     * Declare a path to retain for later rendering and hit testing
     * using custom Path2D class. Think of it as a TypeScript version
     * of the native Path2D (with some differences) that works in all browsers.
     */
    readonly path = new Path2D();

    @ScenePathChangeDetection()
    clipPath?: Path2D;

    @ScenePathChangeDetection()
    clipMode?: 'normal' | 'punch-out';

    constructor(private readonly renderOverride?: (ctx: CanvasRenderingContext2D) => void) {
        super();
    }

    /**
     * The path only has to be updated when certain attributes change.
     * For example, if transform attributes (such as `translationX`)
     * are changed, we don't have to update the path. The `dirtyPath` flag
     * is how we keep track if the path has to be updated or not.
     */
    private _dirtyPath = true;
    set dirtyPath(value: boolean) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.markDirty(this, RedrawType.MAJOR);
            }
        }
    }
    get dirtyPath(): boolean {
        return this._dirtyPath;
    }

    checkPathDirty() {
        if (this._dirtyPath) {
            return;
        }

        this.dirtyPath = this.path.isDirty() || (this.fillShadow?.isDirty() ?? false);
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    }

    protected isDirtyPath() {
        // Override point for more expensive dirty checks.
    }
    protected updatePath() {
        // Override point for subclasses.
    }

    render(renderCtx: RenderContext) {
        let { ctx, forceRender } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
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
            } else {
                this.path.draw(ctx);
                this.fillStroke(ctx);
            }

            if (this.clipMode === 'punch-out') {
                // Bound the shape rendered to outside the clipping path.
                this.clipPath.draw(ctx);
                ctx.clip();
                // Fallback values, but practically these should never be used.
                const { x = -10000, y = -10000, width = 20000, height = 20000 } = this.computeBBox() ?? {};
                ctx.clearRect(x, y, width, height);
            }

            ctx.restore();
        } else if (this.renderOverride) {
            this.renderOverride(ctx);
        } else {
            this.path.draw(ctx);
            this.fillStroke(ctx);
        }

        this.fillShadow?.markClean();
        super.render(renderCtx);
    }
}
