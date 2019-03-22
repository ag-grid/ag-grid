import {Shape} from "./shape";
import {Path2D} from "../path2D";

export class SvgPath extends Shape {

    protected path2d = new Path2D();

    // Path definition in SVG path syntax.
    private _path: string = '';
    set path(value: string) {
        if (this._path !== value) {
            this._path = value;
            this.path2d.setFromString(value);
            this.dirty = true;
        }
    }
    get path(): string {
        return this._path;
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);

        return this.path2d.isPointInPath(point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.applyContextAttributes(ctx);
        this.scene!.appendPath(this.path2d);

        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.strokeStyle) {
            ctx.stroke();
        }

        this.dirty = false;
    }
}
