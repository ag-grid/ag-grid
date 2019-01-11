// ag-grid-enterprise v20.0.0
import { Scene } from "./scene";
/**
 * Abstract scene graph node.
 * Each node can have zero or more children, zero or one parent
 * and belong to zero or one scene.
 */
export declare abstract class Node {
    private static id;
    private createId;
    readonly id: string;
    private _scene?;
    scene: Scene | undefined;
    private _parent?;
    parent: Node | undefined;
    private _children;
    readonly children: Node[];
    private childSet;
    add(...args: Node[]): void;
    abstract render(ctx: CanvasRenderingContext2D): void;
    /**
     * Determines the order of rendering of this node within the parent node.
     * By default the child nodes are rendered in the order in which they were added.
     */
    zIndex: number;
    /**
     * Each time a property of the node that effects how it renders changes
     * the `dirty` property of the node should be set to `true`. The
     * change to the `dirty` property of the node will propagate up to its
     * parents and eventually to the scene, at which point an animation frame
     * callback will be scheduled to rerender the scene and its nodes and reset
     * the `dirty` flags of all nodes and the scene back to `false`.
     * Since we don't render changes to node properties immediately, we can
     * set as many as we like and the rendering will still only happen once
     * on the next animation frame callback.
     * The animation frame callback is only scheduled, if it hasn't been already.
     */
    private _dirty;
    dirty: boolean;
    private static svg;
    static createSvgMatrix(): SVGMatrix;
    static createSvgMatrixFrom(a: number, b: number, c: number, d: number, e: number, f: number): SVGMatrix;
    static createDomMatrix(a: number, b: number, c: number, d: number, e: number, f: number): DOMMatrix;
}
