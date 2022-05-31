import { Node, RedrawType, SceneChangeDetection, RenderContext } from "./node";
import { BBox } from "./bbox";
import { Matrix } from "./matrix";
import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Scene } from "./scene";
import { Path2D } from "./path2D";

export class Group extends Node {

    static className = 'Group';

    private layer?: HdpiCanvas;
    private clipPath: Path2D = new Path2D();
    readonly name?: string;

    @SceneChangeDetection({
        convertor: (v: number) => Math.min(1, Math.max(0, v)),
        changeCb: (o) => o.opacityChanged(),
    })
    opacity: number = 1;

    protected opacityChanged() {
        if (this.layer) {
            this.layer.opacity = this.opacity;
        }
    }

    public constructor(
        private readonly opts?: {
            layer?: boolean,
            zIndex?: number,
            name?: string,
        }
    ) {
        super();

        this.isContainerNode = true;
        if (this.opts?.zIndex !== undefined) {
            this.zIndex = this.opts.zIndex;
        }
        this.name = this.opts?.name;
    }

    _setScene(scene?: Scene) {
        if (this._scene && this.layer) {
            this._scene.removeLayer(this.layer);
            this.layer = undefined;
        }

        if (this.layer) {
            throw new Error('AG Charts - unable to deregister scene rendering layer!');
        }

        super._setScene(scene);

        if (scene && this.opts?.layer) {
            const { zIndex, name } = this.opts || {};
            this.layer = scene.addLayer({ zIndex, name });
        }
    }

    protected visibilityChanged() {
        if (this.layer) {
            this.layer.enabled = this.visible;
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
        const { opts: { name = undefined } = {} } = this;
        const { _debug: { consoleLog = false, onlyLayers = [] } = {} } = this;
        const { dirty, dirtyZIndex, clipPath, layer, children } = this;
        let { ctx, forceRender, clipBBox, resized, stats } = renderCtx;

        const isDirty = dirty >= RedrawType.MINOR || dirtyZIndex || resized;
        const isChildDirty = isDirty || children.some((n) => n.dirty >= RedrawType.TRIVIAL);

        if (name && consoleLog) {
            console.log({ name, group: this, isDirty, isChildDirty, renderCtx, forceRender });
        }

        if (layer) {
            // By default there is no need to force redraw a group which has it's own canvas layer
            // as the layer is independent of any other layer.
            forceRender = false;
        }

        if (!isDirty && !isChildDirty && !forceRender) {
            if (name && consoleLog && stats) {
                const counts = this.nodeCount;
                console.log({ name, result: 'skipping', renderCtx, counts, group: this });
            }

            if (layer && stats) {
                stats.layersSkipped++;
            }
            if (stats) stats.nodesSkipped += this.nodeCount.count;

            // Nothing to do.
            return;
        }

        let groupVisible = this.visible;
        if (layer) {
            // Switch context to the canvas layer we use for this group.
            ctx = layer.context;
            ctx.save();
            ctx.setTransform(renderCtx.ctx.getTransform());

            forceRender = true;
            layer.clear();

            if (clipBBox) {
                const { width, height, x, y } = clipBBox;

                if (consoleLog) {
                    console.log({ name, clipBBox, ctxTransform: ctx.getTransform(), renderCtx, group: this });
                }

                clipPath.clear();
                clipPath.rect(x, y, width, height);
                clipPath.draw(ctx);
                ctx.clip();
            }

            if (onlyLayers.length > 0) {
                groupVisible = !!name && onlyLayers.indexOf(name) >= 0;
            }
        } else {
            // Only apply opacity if this isn't a distinct layer - opacity will be applied
            // at composition time.
            ctx.globalAlpha *= this.opacity;
        }

        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        clipBBox = clipBBox ? this.matrix.inverse().transformBBox(clipBBox) : undefined;

        if (dirtyZIndex) {
            this.dirtyZIndex = false;
            children.sort((a, b) => a.zIndex - b.zIndex);
            forceRender = true;
        }

        // Reduce churn if renderCtx is identical.
        const renderContextChanged = forceRender !== renderCtx.forceRender ||
             clipBBox !== renderCtx.clipBBox ||
             ctx !== renderCtx.ctx;
        const childRenderContext =  renderContextChanged ?
            { ...renderCtx, ctx, forceRender, clipBBox } :
            renderCtx;

        // Render visible children.
        let skipped = 0;
        for (const child of children) {
            if (!child.visible || !groupVisible) {
                // Skip invisible children, but make sure their dirty flag is reset.
                child.markClean();
                if (stats) skipped += child.nodeCount.count;
                continue;
            }

            if (!forceRender && child.dirty === RedrawType.NONE) {
                // Skip children that don't need to be redrawn.
                if (stats) skipped += child.nodeCount.count;
                continue;
            }

            ctx.save();
            child.render(childRenderContext);
            ctx.restore();
        }
        if (stats) stats.nodesSkipped += skipped;

        super.render(renderCtx);

        if (layer) {
            if (stats) stats.layersRendered++;
            ctx.restore();
        }

        if (name && consoleLog && stats) {
            const counts = this.nodeCount;
            console.log({ name, result: 'rendered', skipped, renderCtx, counts, group: this });
        }
    }
}
