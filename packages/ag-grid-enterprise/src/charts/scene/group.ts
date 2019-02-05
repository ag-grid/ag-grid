import {Node} from "./node";

export class Group extends Node {

    private readonly isGroup = true;
    static isGroup(node: any): node is Group {
        return node ? (node as Group).isGroup === true : false;
    }

    render(ctx: CanvasRenderingContext2D) {
        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        // TODO: stable sort the child nodes by the zIndex before rendering them.
        const children = this.children;
        const n = children.length;
        for (let i = 0; i < n; i++) {
            ctx.save();
            children[i].render(ctx);
            ctx.restore();
        }
    }
}
