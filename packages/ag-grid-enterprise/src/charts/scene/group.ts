import {Node} from "./node";

export class Group extends Node {
    render(ctx: CanvasRenderingContext2D) {
        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        // TODO: stable sort the child nodes by the zIndex before rendering them.
        this.children.forEach(child => {
            ctx.save();
            child.render(ctx);
            ctx.restore();
        });
    }
}
