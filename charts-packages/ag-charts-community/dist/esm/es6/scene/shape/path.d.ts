import { Shape } from './shape';
import { Path2D } from '../path2D';
import { RedrawType, RenderContext } from '../node';
export declare function ScenePathChangeDetection(opts?: {
    redraw?: RedrawType;
    convertor?: (o: any) => any;
    changeCb?: (t: any) => any;
}): (target: any, key: string) => void;
export declare class Path extends Shape {
    private readonly renderOverride?;
    static className: string;
    /**
     * Declare a path to retain for later rendering and hit testing
     * using custom Path2D class. Think of it as a TypeScript version
     * of the native Path2D (with some differences) that works in all browsers.
     */
    readonly path: Path2D;
    clipPath?: Path2D;
    clipMode?: 'normal' | 'punch-out';
    constructor(renderOverride?: ((ctx: CanvasRenderingContext2D) => void) | undefined);
    /**
     * The path only has to be updated when certain attributes change.
     * For example, if transform attributes (such as `translationX`)
     * are changed, we don't have to update the path. The `dirtyPath` flag
     * is how we keep track if the path has to be updated or not.
     */
    private _dirtyPath;
    set dirtyPath(value: boolean);
    get dirtyPath(): boolean;
    checkPathDirty(): void;
    isPointInPath(x: number, y: number): boolean;
    protected isDirtyPath(): void;
    protected updatePath(): void;
    render(renderCtx: RenderContext): void;
}
