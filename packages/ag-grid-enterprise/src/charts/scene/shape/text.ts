import { Shape } from "./shape";
import {chainObjects} from "../../util/object";

export class Text extends Shape {
    protected static defaults = chainObjects(Shape.defaults, {
        fillStyle: 'black',

        centerX: 0,
        centerY: 0
    });

    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return false;
    }

    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.scene) {
            this.applyContextAttributes(ctx);
            // this.scene.appendPath(this.path);
            ctx.fill();
            ctx.stroke();
        }

        this.dirty = false;
    }
}
