import { Node, RedrawType, SceneChangeDetection, RenderContext } from "./node";
import { BBox } from "./bbox";
import { Matrix } from "./matrix";
import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Scene } from "./scene";

export class Group extends Node {

    static className = 'Group';

    private canvas?: HdpiCanvas;

    @SceneChangeDetection({ convertor: (v: number) => Math.min(1, Math.max(0, v)) })
    opacity: number = 1;

    public constructor(
        private readonly opts?: {
            layer?: boolean,
            zIndex?: number,
            name?: string,
        }
    ) {
        super();

        this.isContainerNode = true;
    }

    _setScene(scene?: Scene) {
        if (this._scene && this.canvas) {
            this._scene.removeLayer(this.canvas);
            this.canvas = undefined;
        }

        super._setScene(scene);

        if (scene && this.opts?.layer) {
            const { zIndex, name } = this.opts || {};
            this.canvas = scene.addLayer({ zIndex, name });
        }
    }

    markDirty(type = RedrawType.TRIVIAL) {
        const parentType = type <= RedrawType.MINOR ? RedrawType.TRIVIAL : type;
        super.markDirty(type, parentType);
    }

    // We consider a group to be boundless, thus any point belongs to it.
    containsPoint(_x: number, _y: number): boolean {
        return true;
    }

    computeBBox(): BBox {
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        this.computeTransformMatrix();

        this.children.forEach(child => {
            if (!child.visible) {
                return;
            }
            const bbox = child.computeBBox();
            if (!bbox) {
                return;
            }

            if (!(child instanceof Group)) {
                child.computeTransformMatrix();
                const matrix = Matrix.flyweight(child.matrix);
                let parent = child.parent;
                while (parent) {
                    matrix.preMultiplySelf(parent.matrix);
                    parent = parent.parent;
                }
                matrix.transformBBox(bbox, 0, bbox);
            }

            const x = bbox.x;
            const y = bbox.y;

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

        return new BBox(
            left,
            top,
            right - left,
            bottom - top
        );
    }

    render(renderCtx: RenderContext) {
        const { name } = this.opts || {};
        let { ctx, forceRender, clipBBox } = renderCtx;

        const isDirty = this.dirty >= RedrawType.TRIVIAL || this.dirtyZIndex;

        if (name && this.scene?.debug?.consoleLog) {
            console.log({ name, group: this, isDirty, forceRender });
        }

        if (this.canvas) {
            // Dy default there is no need to force redraw a group which has it's own canvas layer
            // as the layer is independent of any other layer.
            forceRender = false;
        }

        if (!isDirty && !forceRender) {
            // Nothing to do.
            return;
        }

        const originalTransform = ctx.getTransform();
        if (this.canvas) {
            // Switch context to the canvas layer we use for this group.
            ctx = this.canvas.context;
            ctx.save();
            ctx.resetTransform();

            if (clipBBox) {
                const { width, height, x, y } = clipBBox;
                ctx.rect(x, y, width, height);
                ctx.clip()
            }

            if (isDirty) {
                forceRender = true;
                this.canvas?.clear();
            }
        }

        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        clipBBox = clipBBox ? this.matrix.transformBBox(clipBBox) : undefined;

        const { children } = this;
        if (this.dirtyZIndex) {
            this.dirtyZIndex = false;
            children.sort((a, b) => a.zIndex - b.zIndex);
            forceRender = true;
        }

        ctx.globalAlpha *= this.opacity;

        // Reduce churn if renderCtx is identical.
        const renderContextChanged = forceRender !== renderCtx.forceRender ||
             clipBBox !== renderCtx.clipBBox ||
             ctx !== renderCtx.ctx;
        const childRenderContext =  renderContextChanged ?
            { ...renderCtx, ctx, forceRender, clipBBox } :
            renderCtx;

        // Render visible children.
        for (const child of children) {
            if (!child.visible) {
                // Skip invisible children.
                continue;
            }

            if (!forceRender && child.dirty === RedrawType.NONE) {
                // Skip children that don't need to be redrawn.
                continue;
            }

            ctx.save();
            child.render(childRenderContext);
            ctx.restore();
        }

        super.render(renderCtx);

        if (this.canvas) {
            ctx.restore();
        }
        ctx.setTransform(originalTransform);
    }
}
