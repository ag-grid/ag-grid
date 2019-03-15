import {Node} from "./node";

export class Group extends Node {

    // We consider a group to be boundless, thus any point belongs to it.
    isPointInNode(x: number, y: number): boolean {
        return true;
    }

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
    }
}
