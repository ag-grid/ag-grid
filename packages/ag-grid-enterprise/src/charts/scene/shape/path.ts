import { Shape } from "./shape";
import { Path2D } from "../path2D";

export class Path extends Shape {

    static className = 'Path';

    /**
     * Make sure to set {@link dirty} to `true` after changing the path.
     */
    readonly path = new Path2D();

    private _dirtyPath = true;
    set dirtyPath(value: boolean) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyPath(): boolean {
        return this._dirtyPath;
    }

    /**
     * Path definition in SVG path syntax:
     * https://www.w3.org/TR/SVG11/paths.html#DAttribute
     */
    private _svgPath: string = '';
    set svgPath(value: string) {
        if (this._svgPath !== value) {
            this._svgPath = value;
            this.path.setFromString(value);
            this.dirty = true;
        }
    }
    get svgPath(): string {
        return this._svgPath;
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);

        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    protected updatePath() {}

    render(ctx: CanvasRenderingContext2D): void {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        if (this.dirtyPath) {
            this.updatePath();
            this.dirtyPath = false;
        }
        this.scene!.appendPath(this.path);

        this.fillStroke(ctx);

        this.dirty = false;
    }
}
