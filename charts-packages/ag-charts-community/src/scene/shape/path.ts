import { Shape } from "./shape";
import { Path2D } from "../path2D";

export class Path extends Shape {

    static className = 'Path';

    /**
     * Declare a path to retain for later rendering and hit testing
     * using custom Path2D class. Think of it as a TypeScript version
     * of the native Path2D (with some differences) that works in all browsers.
     */
    readonly path = new Path2D();

     /**
     * The path only has to be updated when certain attributes change.
     * For example, if transform attributes (such as `translationX`)
     * are changed, we don't have to update the path. The `dirtyPath` flag
     * is how we keep track if the path has to be updated or not.
     */
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
        const scene = this.scene!;

        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // if (scene.debug.renderBoundingBoxes) {
        //     const bbox = this.computeBBox();
        //     if (bbox) {
        //         this.matrix.transformBBox(bbox).render(ctx);
        //     }
        // }
        this.matrix.toContext(ctx);

        if (this.dirtyPath) {
            this.updatePath();
            this.dirtyPath = false;
        }
        scene.appendPath(this.path);

        this.fillStroke(ctx);

        this.dirty = false;
    }
}
