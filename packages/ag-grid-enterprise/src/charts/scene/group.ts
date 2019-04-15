import { Node } from "./node";
import { BBox, renderBBox } from "./bbox";
import { Matrix } from "./matrix";

export class Group extends Node {

    // We consider a group to be boundless, thus any point belongs to it.
    isPointInNode(x: number, y: number): boolean {
        return true;
    }

    readonly getBBox = (): BBox => {
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        this.children.forEach(child => {
            if (child.getBBox) {
                const bbox = child.getBBox();

                if (!(child instanceof Group)) {
                    if (child.dirtyTransform) {
                        child.computeTransformMatrix();
                    }
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
            }
        });

        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
        };
    };

    render(ctx: CanvasRenderingContext2D) {
        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        const children = this.children;
        const n = children.length;

        for (let i = 0; i < n; i++) {
            ctx.save();
            const child = children[i];
            if (child.visible) {
                child.render(ctx);
            }
            ctx.restore();
        }

        // debug
        // renderBBox({
        //     ctx,
        //     bbox: this.getBBox(),
        //     text: this.id,
        //     resetTransform: true,
        //     fillStyle: 'rgba(0, 0, 0, 0.5)',
        //     strokeStyle: 'cyan'
        // });
    }
}
