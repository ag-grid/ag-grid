import { Node, RedrawType, SceneChangeDetection, RenderContext } from './node';
import { BBox } from './bbox';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { Scene } from './scene';
import { Path2D } from './path2D';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
import { compoundAscending, ascendingStringNumberUndefined } from '../util/compare';

export class Group extends Node {
    static className = 'Group';

    protected layer?: HdpiCanvas | HdpiOffscreenCanvas;
    protected clipPath: Path2D = new Path2D();
    readonly name?: string;

    readonly dirtyChildren?: Record<string, Node>;
    readonly visibleChildren?: Record<string, Node>;

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

    protected zIndexChanged() {
        if (this.layer) {
            this._scene?.moveLayer(this.layer, this.zIndex, this.zIndexSubOrder);
        }
    }

    isLayer() {
        return this.layer != null;
    }

    public constructor(
        protected readonly opts?: {
            readonly layer?: boolean;
            readonly zIndex?: number;
            readonly zIndexSubOrder?: [string, number];
            readonly name?: string;
            readonly optimiseDirtyTracking?: boolean;
        }
    ) {
        super();

        const { zIndex, zIndexSubOrder } = opts || {};

        this.isContainerNode = true;
        if (zIndex !== undefined) {
            this.zIndex = zIndex;
        }
        if (zIndexSubOrder !== undefined) {
            this.zIndexSubOrder = zIndexSubOrder;
        }
        if (this.opts?.optimiseDirtyTracking) {
            this.visibleChildren = {};
            this.dirtyChildren = {};
        }
        this.name = this.opts?.name;
    }

    append(nodes: Node[] | Node) {
        super.append(nodes);

        if (this.dirtyChildren) {
            nodes = nodes instanceof Array ? nodes : [nodes];
            for (const node of nodes) {
                this.dirtyChildren[node.id] = node;
            }
        }
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
            const { zIndex, zIndexSubOrder, name } = this.opts || {};
            this.layer = scene.addLayer({ zIndex, zIndexSubOrder, name });
        }
    }

    protected visibilityChanged() {
        if (this.layer) {
            this.layer.enabled = this.visible;
        }
    }

    removeChild<T extends Node>(node: T): T {
        super.removeChild(node);

        if (this.dirtyChildren && this.visibleChildren) {
            delete this.dirtyChildren[node.id];
            delete this.visibleChildren[node.id];
        }

        return node;
    }

    markDirty(source: Node, type = RedrawType.TRIVIAL) {
        const parentType = type <= RedrawType.MINOR ? RedrawType.TRIVIAL : type;
        super.markDirty(source, type, parentType);

        if (source !== this && this.dirtyChildren) {
            this.dirtyChildren[source.id] = source;
        }
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

        this.children.forEach((child) => {
            if (!child.visible) {
                return;
            }
            const bbox = child.computeTransformedBBox();
            if (!bbox) {
                return;
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

        return new BBox(left, top, right - left, bottom - top);
    }

    computeTransformedBBox(): BBox | undefined {
        return this.computeBBox();
    }

    preChildRender(renderCtx: RenderContext) {
        let { ctx, forceRender, clipBBox } = renderCtx;
        const { layer, clipPath, dirtyZIndex } = this;

        if (layer) {
            // Switch context to the canvas layer we use for this group.
            ctx = layer.context;
            ctx.save();
            ctx.setTransform(renderCtx.ctx.getTransform());

            forceRender = true;
            layer.clear();

            if (clipBBox) {
                const { width, height, x, y } = clipBBox;

                clipPath.clear();
                clipPath.rect(x, y, width, height);
                clipPath.draw(ctx);
                ctx.clip();
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
            this.sortChildren();
            forceRender = true;
        }

        // Reduce churn if renderCtx is identical.
        const renderContextChanged =
            forceRender !== renderCtx.forceRender || clipBBox !== renderCtx.clipBBox || ctx !== renderCtx.ctx;
        return renderContextChanged ? { ...renderCtx, ctx, forceRender, clipBBox } : renderCtx;
    }

    postChildRender(renderCtx: RenderContext) {
        let { ctx } = renderCtx;
        const { layer } = this;

        if (layer) {
            ctx.restore();
            layer.snapshot();
        }
    }

    private sortChildren() {
        this.dirtyZIndex = false;
        this.children.sort((a, b) => {
            return compoundAscending(
                [a.zIndex, ...(a.zIndexSubOrder ?? [undefined, undefined]), a.serialNumber],
                [b.zIndex, ...(b.zIndexSubOrder ?? [undefined, undefined]), b.serialNumber],
                ascendingStringNumberUndefined
            );
        });
    }
}
