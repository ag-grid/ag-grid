import { Matrix } from './matrix';
import { BBox } from './bbox';
import { ChangeDetectable, SceneChangeDetection, RedrawType } from './changeDetectable';
import { SceneDebugOptions } from './sceneDebugOptions';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
export { SceneChangeDetection, RedrawType };
declare type OffscreenCanvasRenderingContext2D = any;
export declare enum PointerEvents {
    All = 0,
    None = 1
}
export declare type RenderContext = {
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    forceRender: boolean;
    resized: boolean;
    clipBBox?: BBox;
    stats?: {
        nodesRendered: number;
        nodesSkipped: number;
        layersRendered: number;
        layersSkipped: number;
    };
    debugNodes: Record<string, Node>;
};
declare type Layer = HdpiCanvas | HdpiOffscreenCanvas;
export interface LayerManager {
    debug: SceneDebugOptions;
    canvas: Layer;
    markDirty(): void;
    addLayer(opts: {
        zIndex?: number;
        zIndexSubOrder?: [string, number];
        name?: string;
        getComputedOpacity: () => number;
        getVisibility: () => boolean;
    }): Layer | undefined;
    moveLayer(canvas: Layer, zIndex: number, zIndexSubOrder?: [string, number]): void;
    removeLayer(canvas: Layer): void;
}
/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
export declare abstract class Node extends ChangeDetectable {
    static _nextSerialNumber: number;
    /** Unique number to allow creation order to be easily determined. */
    readonly serialNumber: number;
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
    protected _debug?: SceneDebugOptions;
    protected _layerManager?: LayerManager;
    _setLayerManager(value?: LayerManager): void;
    get layerManager(): LayerManager | undefined;
    private _parent?;
    get parent(): Node | undefined;
    private _children;
    get children(): Node[];
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
    get nextSibling(): Node | undefined;
    matrix: Matrix;
    protected inverseMatrix: Matrix;
    transformPoint(x: number, y: number): {
        x: number;
        y: number;
    };
    inverseTransformPoint(x: number, y: number): {
        x: number;
        y: number;
    };
    private _dirtyTransform;
    markDirtyTransform(): void;
    scalingX: number;
    scalingY: number;
    /**
     * The center of scaling.
     * The default value of `null` means the scaling center will be
     * determined automatically, as the center of the bounding box
     * of a node.
     */
    scalingCenterX: number | null;
    scalingCenterY: number | null;
    rotationCenterX: number | null;
    rotationCenterY: number | null;
    /**
     * Rotation angle in radians.
     * The value is set as is. No normalization to the [-180, 180) or [0, 360)
     * interval is performed.
     */
    rotation: number;
    translationX: number;
    translationY: number;
    containsPoint(_x: number, _y: number): boolean;
    /**
     * Hit testing method.
     * Recursively checks if the given point is inside this node or any of its children.
     * Returns the first matching node or `undefined`.
     * Nodes that render later (show on top) are hit tested first.
     */
    pickNode(x: number, y: number): Node | undefined;
    findNodes(predicate: (node: Node) => boolean): Node[];
    computeBBox(): BBox | undefined;
    computeTransformedBBox(): BBox | undefined;
    computeBBoxCenter(): [number, number];
    computeTransformMatrix(): void;
    render(renderCtx: RenderContext): void;
    clearBBox(ctx: CanvasRenderingContext2D): void;
    markDirty(_source: Node, type?: RedrawType, parentType?: RedrawType): void;
    get dirty(): RedrawType;
    markClean(opts?: {
        force?: boolean;
        recursive?: boolean;
    }): void;
    visible: boolean;
    protected visibilityChanged(): void;
    protected dirtyZIndex: boolean;
    zIndex: number;
    /** Discriminators for render order within a zIndex. */
    zIndexSubOrder?: [string, number];
    pointerEvents: PointerEvents;
    get nodeCount(): {
        count: number;
        visibleCount: number;
        dirtyCount: number;
    };
    protected zIndexChanged(): void;
}
