import type { RenderContext } from '../node';
import { RedrawType } from '../node';
import { Path2D } from '../path2D';
import { Shape } from './shape';
export declare function ScenePathChangeDetection(opts?: {
    redraw?: RedrawType;
    convertor?: (o: any) => any;
    changeCb?: (t: any) => any;
}): (target: any, key: string) => void;
export declare class Path extends Shape {
    static className: string;
    /**
     * Declare a path to retain for later rendering and hit testing
     * using custom Path2D class. Think of it as a TypeScript version
     * of the native Path2D (with some differences) that works in all browsers.
     */
    readonly path: Path2D;
    private _clipX;
    private _clipY;
    private _clipPath?;
    clipMode?: 'normal' | 'punch-out';
    set clipX(value: number);
    set clipY(value: number);
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
    protected isDirtyPath(): boolean;
    updatePath(): void;
    render(renderCtx: RenderContext): void;
}
