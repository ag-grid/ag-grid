import { Node, RedrawType } from "./node";
import { BBox } from "./bbox";
import { Matrix } from "./matrix";

export class Group extends Node {

    static className = 'Group';

    protected isContainerNode: boolean = true;

    markDirty(type = RedrawType.TRIVIAL) {
        const parentType = type <= RedrawType.MINOR ? RedrawType.TRIVIAL : type;
        super.markDirty(type, parentType);
    }

    protected _opacity: number = 1;
    set opacity(value: number) {
        value = Math.min(1, Math.max(0, value));
        if (this._opacity !== value) {
            this._opacity = value;
            this.markDirty(RedrawType.MINOR);
        }
    }
    get opacity(): number {
        return this._opacity;
    }

    // We consider a group to be boundless, thus any point belongs to it.
    containsPoint(x: number, y: number): boolean {
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

    render(ctx: CanvasRenderingContext2D, forceRender: boolean) {
        if (this.dirty === RedrawType.NONE && !forceRender) {
            return;
        }

        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);

        const clearNeeded = this.dirty >= RedrawType.MINOR;
        if (!forceRender && clearNeeded) {
            forceRender = true;
            this.clearBBox(ctx);
        }

        const children = this.children;
        const n = children.length;

        if (this.dirtyZIndex) {
            this.dirtyZIndex = false;
            children.sort((a, b) => a.zIndex - b.zIndex);
        }

        ctx.globalAlpha *= this.opacity;

        for (let i = 0; i < n; i++) {
            const child = children[i];
            if (child.visible && (forceRender || child.dirty > RedrawType.NONE)) {
                ctx.save();
                child.render(ctx, forceRender);
                ctx.restore();
            }
        }

        super.render(ctx, forceRender);

        // debug
        // this.computeBBox().render(ctx, {
        //     label: this.id,
        //     resetTransform: true,
        //     fillStyle: 'rgba(0, 0, 0, 0.5)'
        // });
    }
}
