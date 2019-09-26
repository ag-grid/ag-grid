// ag-grid-enterprise v21.2.2
import { Scene } from "./scene";
import { Matrix } from "./matrix";
import { BBox } from "./bbox";
export declare enum PointerEvents {
    All = 0,
    None = 1
}
/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
export declare abstract class Node {
    private createId;
    /**
     * Unique node ID in the form `ClassName-NaturalNumber`.
     */
    readonly id: string;
    /**
     * Some arbitrary data bound to the node.
     */
    datum: any;
    /**
     * Some number to identify this node, typically within a `Group` node.
     * Usually this will be some enum value used as a selector.
     */
    tag: number;
    /**
     * This is meaningfully faster than `instanceof` and should be the preferred way
     * of checking inside loops.
     * @param node
     */
    static isNode(node: any): node is Node;
    /**
     * To simplify the type system (especially in Selections) we don't have the `Parent` node
     * (one that has children). Instead, we mimic HTML DOM, where any node can have children.
     * But we still need to distinguish regular leaf nodes from container leafs somehow.
     */
    protected isContainerNode: boolean;
    protected _scene?: Scene;
    _setScene(value?: Scene): void;
    readonly scene: Scene | undefined;
    private _parent?;
    _setParent(value?: Node): void;
    readonly parent: Node | undefined;
    private _children;
    readonly children: ReadonlyArray<Node>;
    private static MAX_SAFE_INTEGER;
    countChildren(depth?: number): number;
    private childSet;
    /**
     * Appends one or more new node instances to this parent.
     * If one needs to:
     * - move a child to the end of the list of children
     * - move a child from one parent to another (including parents in other scenes)
     * one should use the {@link insertBefore} method instead.
     * @param nodes A node or nodes to append.
     */
    append(nodes: Node[] | Node): void;
    appendChild<T extends Node>(node: T): T;
    removeChild<T extends Node>(node: T): T;
    /**
     * Inserts the node `node` before the existing child node `nextNode`.
     * If `nextNode` is null, insert `node` at the end of the list of children.
     * If the `node` belongs to another parent, it is first removed.
     * Returns the `node`.
     * @param node
     * @param nextNode
     */
    insertBefore<T extends Node>(node: T, nextNode?: Node | null): T;
    matrix: Matrix;
    protected inverseMatrix: Matrix;
    /**
     * Calculates the combined inverse transformation for this node,
     * and uses it to convert the given transformed point
     * to the untransformed one.
     * @param x
     * @param y
     */
    transformPoint(x: number, y: number): {
        x: number;
        y: number;
    };
    private _dirtyTransform;
    dirtyTransform: boolean;
    private _scalingX;
    scalingX: number;
    private _scalingY;
    scalingY: number;
    /**
     * The center of scaling.
     * The default value of `null` means the scaling center will be
     * determined automatically, as the center of the bounding box
     * of a node.
     */
    private _scalingCenterX;
    scalingCenterX: number | null;
    private _scalingCenterY;
    scalingCenterY: number | null;
    private _rotationCenterX;
    rotationCenterX: number | null;
    private _rotationCenterY;
    rotationCenterY: number | null;
    /**
     * Rotation angle in radians.
     * The value is set as is. No normalization to the [-180, 180) or [0, 360)
     * interval is performed.
     */
    private _rotation;
    rotation: number;
    /**
     * For performance reasons the rotation angle's internal representation
     * is in radians. Therefore, don't expect to get the same number you set.
     * Even with integer angles about a quarter of them from 0 to 359 cannot
     * be converted to radians and back without precision loss.
     * For example:
     *
     *     node.rotationDeg = 11;
     *     console.log(node.rotationDeg); // 10.999999999999998
     *
     * @param value Rotation angle in degrees.
     */
    rotationDeg: number;
    private _translationX;
    translationX: number;
    private _translationY;
    translationY: number;
    isPointInNode(x: number, y: number): boolean;
    /**
     * Hit testing method.
     * Recursively checks if the given point is inside this node or any of its children.
     * Returns the first matching node or `undefined`.
     * Nodes that render later (show on top) are hit tested first.
     * @param x
     * @param y
     */
    pickNode(x: number, y: number): Node | undefined;
    getBBox(): BBox | undefined;
    getBBoxCenter(): [number, number];
    computeTransformMatrix(): void;
    /**
     * Scene nodes start rendering with the {@link Scene.root | root},
     * where the `render` call propagates from parent nodes to their children.
     * The root rendering is initiated by the {@link Scene.render} method,
     * so if the `render` method of a node is called, that node belongs to a scene,
     * and there is no need to check if node's {@link Node._scene} property
     * is defined inside node's `render` method. For example, instead of doing this:
     *
     *     if (!this.scene) return;
     *     this.scene.appendPath(this.path);
     *
     * it's safe to do this:
     *
     *     this.scene!.appendPath(this.path);
     *
     * @param ctx The 2D canvas rendering context.
     */
    abstract render(ctx: CanvasRenderingContext2D): void;
    /**
     * Each time a property of the node that effects how it renders changes
     * the `dirty` property of the node should be set to `true`. The change
     * to the `dirty` property of the node will propagate up to its parents
     * and eventually to the scene, at which point an animation frame callback
     * will be scheduled to rerender the scene and its nodes and reset the `dirty`
     * flags of all nodes and the {@link Scene._dirty | Scene} back to `false`.
     * Since changes to node properties are not rendered immediately, it's possible
     * to change as many properties on as many nodes as needed and the rendering
     * will still only happen once in the next animation frame callback.
     * The animation frame callback is only scheduled if it hasn't been already.
     */
    private _dirty;
    dirty: boolean;
    private _visible;
    visible: boolean;
    pointerEvents: PointerEvents;
}
