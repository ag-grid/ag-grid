import { Scene } from './scene';
import { Matrix } from './matrix';
import { BBox } from './bbox';
import { createId } from '../util/id';
import { ChangeDetectable, SceneChangeDetection, RedrawType } from './changeDetectable';

export { SceneChangeDetection, RedrawType };

// Work-around for typing issues with Angular 13+ (see AG-6969),
type OffscreenCanvasRenderingContext2D = any;

export enum PointerEvents {
    All,
    None,
}

export type RenderContext = {
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
};

const zIndexChangedCallback = (o: any) => {
    if (o.parent) {
        o.parent.dirtyZIndex = true;
    }
    o.zIndexChanged();
};

/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
export abstract class Node extends ChangeDetectable {
    static _nextSerialNumber = 0;

    /** Unique number to allow creation order to be easily determined. */
    readonly serialNumber = Node._nextSerialNumber++;

    /**
     * Unique node ID in the form `ClassName-NaturalNumber`.
     */
    readonly id = createId(this);

    /**
     * Some arbitrary data bound to the node.
     */
    datum: any;

    /**
     * Some number to identify this node, typically within a `Group` node.
     * Usually this will be some enum value used as a selector.
     */
    tag: number = NaN;

    /**
     * This is meaningfully faster than `instanceof` and should be the preferred way
     * of checking inside loops.
     * @param node
     */
    static isNode(node: any): node is Node {
        return node ? (node as Node).matrix !== undefined : false;
    }

    /**
     * To simplify the type system (especially in Selections) we don't have the `Parent` node
     * (one that has children). Instead, we mimic HTML DOM, where any node can have children.
     * But we still need to distinguish regular leaf nodes from container leafs somehow.
     */
    protected isContainerNode: boolean = false;

    // Note: _setScene and _setParent methods are not meant for end users,
    // but they are not quite private either, rather, they have package level visibility.

    protected _debug?: Scene['debug'];
    protected _scene?: Scene;
    _setScene(value?: Scene) {
        this._scene = value;
        this._debug = value?.debug;

        for (const child of this.children) {
            child._setScene(value);
        }
    }
    get scene(): Scene | undefined {
        return this._scene;
    }

    private _parent?: Node;
    get parent(): Node | undefined {
        return this._parent;
    }

    private _children: Node[] = [];
    get children(): Node[] {
        return this._children;
    }

    private static MAX_SAFE_INTEGER = Math.pow(2, 53) - 1; // Number.MAX_SAFE_INTEGER

    countChildren(depth = Node.MAX_SAFE_INTEGER): number {
        if (depth <= 0) {
            return 0;
        }

        const children = this.children;
        const n = children.length;
        let size = n;

        for (let i = 0; i < n; i++) {
            size += children[i].countChildren(depth - 1);
        }

        return size;
    }

    // Used to check for duplicate nodes.
    private childSet: { [id: string]: boolean } = {}; // new Set<Node>()

    /**
     * Appends one or more new node instances to this parent.
     * If one needs to:
     * - move a child to the end of the list of children
     * - move a child from one parent to another (including parents in other scenes)
     * one should use the {@link insertBefore} method instead.
     * @param nodes A node or nodes to append.
     */
    append(nodes: Node[] | Node) {
        // Passing a single parameter to an open-ended version of `append`
        // would be 30-35% slower than this.
        if (Node.isNode(nodes)) {
            nodes = [nodes];
        }

        for (const node of nodes) {
            if (node.parent) {
                throw new Error(`${node} already belongs to another parent: ${node.parent}.`);
            }
            if (node.scene) {
                throw new Error(`${node} already belongs to a scene: ${node.scene}.`);
            }
            if (this.childSet[node.id]) {
                // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                throw new Error(`Duplicate ${(node.constructor as any).name} node: ${node}`);
            }

            this._children.push(node);
            this.childSet[node.id] = true;

            node._parent = this;
            node._setScene(this.scene);
        }

        this.dirtyZIndex = true;
        this.markDirty(this, RedrawType.MAJOR);
    }

    appendChild<T extends Node>(node: T): T {
        this.append(node);

        return node;
    }

    removeChild<T extends Node>(node: T): T {
        if (node.parent === this) {
            const i = this.children.indexOf(node);

            if (i >= 0) {
                this._children.splice(i, 1);
                delete this.childSet[node.id];
                node._parent = undefined;
                node._setScene();

                this.dirtyZIndex = true;
                this.markDirty(node, RedrawType.MAJOR);

                return node;
            }
        }
        throw new Error(`The node to be removed is not a child of this node.`);
    }

    /**
     * Inserts the node `node` before the existing child node `nextNode`.
     * If `nextNode` is null, insert `node` at the end of the list of children.
     * If the `node` belongs to another parent, it is first removed.
     * Returns the `node`.
     * @param node
     * @param nextNode
     */
    insertBefore<T extends Node>(node: T, nextNode?: Node | null): T {
        const parent = node.parent;

        if (node.parent) {
            node.parent.removeChild(node);
        }

        if (nextNode && nextNode.parent === this) {
            const i = this.children.indexOf(nextNode);

            if (i >= 0) {
                this._children.splice(i, 0, node);
                this.childSet[node.id] = true;
                node._parent = this;
                node._setScene(this.scene);
            } else {
                throw new Error(`${nextNode} has ${parent} as the parent, ` + `but is not in its list of children.`);
            }

            this.dirtyZIndex = true;
            this.markDirty(node, RedrawType.MAJOR);
        } else {
            this.append(node);
        }

        return node;
    }

    get nextSibling(): Node | undefined {
        const { parent } = this;

        if (parent) {
            const { children } = parent;
            const index = children.indexOf(this);

            if (index >= 0 && index <= children.length - 1) {
                return children[index + 1];
            }
        }
    }

    // These matrices may need to have package level visibility
    // for performance optimization purposes.
    matrix = new Matrix();
    protected inverseMatrix = new Matrix();

    transformPoint(x: number, y: number) {
        const matrix = Matrix.flyweight(this.matrix);

        let parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }

        return matrix.invertSelf().transformPoint(x, y);
    }

    inverseTransformPoint(x: number, y: number) {
        const matrix = Matrix.flyweight(this.matrix);

        let parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }

        return matrix.transformPoint(x, y);
    }

    private _dirtyTransform = false;
    markDirtyTransform() {
        this._dirtyTransform = true;
        this.markDirty(this, RedrawType.MAJOR);
    }

    @SceneChangeDetection({ type: 'transform' })
    scalingX: number = 1;

    @SceneChangeDetection({ type: 'transform' })
    scalingY: number = 1;

    /**
     * The center of scaling.
     * The default value of `null` means the scaling center will be
     * determined automatically, as the center of the bounding box
     * of a node.
     */
    @SceneChangeDetection({ type: 'transform' })
    scalingCenterX: number | null = null;

    @SceneChangeDetection({ type: 'transform' })
    scalingCenterY: number | null = null;

    @SceneChangeDetection({ type: 'transform' })
    rotationCenterX: number | null = null;

    @SceneChangeDetection({ type: 'transform' })
    rotationCenterY: number | null = null;

    /**
     * Rotation angle in radians.
     * The value is set as is. No normalization to the [-180, 180) or [0, 360)
     * interval is performed.
     */
    @SceneChangeDetection({ type: 'transform' })
    rotation: number = 0;

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
    set rotationDeg(value: number) {
        this.rotation = (value / 180) * Math.PI;
    }
    get rotationDeg(): number {
        return (this.rotation / Math.PI) * 180;
    }

    @SceneChangeDetection({ type: 'transform' })
    translationX: number = 0;

    @SceneChangeDetection({ type: 'transform' })
    translationY: number = 0;

    containsPoint(_x: number, _y: number): boolean {
        return false;
    }

    /**
     * Hit testing method.
     * Recursively checks if the given point is inside this node or any of its children.
     * Returns the first matching node or `undefined`.
     * Nodes that render later (show on top) are hit tested first.
     */
    pickNode(x: number, y: number): Node | undefined {
        if (!this.visible || this.pointerEvents === PointerEvents.None || !this.containsPoint(x, y)) {
            return;
        }

        const children = this.children;

        if (children.length > 1_000) {
            // Try to optimise which children to interrogate; BBox calculation is an approximation
            // for more complex shapes, so discarding items based on this will save a lot of
            // processing when the point is nowhere near the child.
            for (let i = children.length - 1; i >= 0; i--) {
                const hit = children[i].computeBBox()?.containsPoint(x, y) ? children[i].pickNode(x, y) : undefined;

                if (hit) {
                    return hit;
                }
            }
        } else if (children.length) {
            // Nodes added later should be hit-tested first,
            // as they are rendered on top of the previously added nodes.
            for (let i = children.length - 1; i >= 0; i--) {
                const hit = children[i].pickNode(x, y);
                if (hit) {
                    return hit;
                }
            }
        } else if (!this.isContainerNode) {
            // a leaf node, but not a container leaf
            return this;
        }
    }

    computeBBox(): BBox | undefined {
        return;
    }

    computeTransformedBBox(): BBox | undefined {
        const bbox = this.computeBBox();

        if (!bbox) {
            return undefined;
        }

        this.computeTransformMatrix();
        const matrix = Matrix.flyweight(this.matrix);
        let parent = this.parent;
        while (parent) {
            parent.computeTransformMatrix();
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        matrix.transformBBox(bbox, 0, bbox);

        return bbox;
    }

    computeBBoxCenter(): [number, number] {
        const bbox = this.computeBBox && this.computeBBox();
        if (bbox) {
            return [bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5];
        }
        return [0, 0];
    }

    computeTransformMatrix() {
        if (!this._dirtyTransform) {
            return;
        }

        const {
            matrix,
            scalingX,
            scalingY,
            rotation,
            translationX,
            translationY,
            scalingCenterX,
            scalingCenterY,
            rotationCenterX,
            rotationCenterY,
        } = this;

        Matrix.updateTransformMatrix(
            matrix,
            scalingX,
            scalingY,
            rotation,
            translationX,
            translationY,
            {
                scalingCenterX,
                scalingCenterY,
                rotationCenterX,
                rotationCenterY,
            }
        );

        matrix.inverseTo(this.inverseMatrix);

        this._dirtyTransform = false;
    }

    render(renderCtx: RenderContext): void {
        const { stats } = renderCtx;

        this._dirty = RedrawType.NONE;

        if (stats) stats.nodesRendered++;
    }

    clearBBox(ctx: CanvasRenderingContext2D) {
        const bbox = this.computeBBox();
        if (bbox == null) {
            return;
        }

        const { x, y, width, height } = bbox;
        const topLeft = this.transformPoint(x, y);
        const bottomRight = this.transformPoint(x + width, y + height);
        ctx.clearRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    }

    markDirty(_source: Node, type = RedrawType.TRIVIAL, parentType = type) {
        if (this._dirty > type) {
            return;
        }

        if (this._dirty === type && type === parentType) {
            return;
        }

        this._dirty = type;
        if (this.parent) {
            this.parent.markDirty(this, parentType);
        } else if (this.scene) {
            this.scene.markDirty();
        }
    }
    get dirty() {
        return this._dirty;
    }

    markClean(opts?: { force?: boolean; recursive?: boolean }) {
        const { force = false, recursive = true } = opts || {};

        if (this._dirty === RedrawType.NONE && !force) {
            return;
        }

        this._dirty = RedrawType.NONE;

        if (recursive) {
            for (const child of this.children) {
                child.markClean();
            }
        }
    }

    @SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: (o) => o.visibilityChanged() })
    visible: boolean = true;
    protected visibilityChanged() {
        // Override point for sub-classes to react to visibility changes.
    }

    protected dirtyZIndex: boolean = false;

    @SceneChangeDetection({
        redraw: RedrawType.TRIVIAL,
        changeCb: zIndexChangedCallback,
    })
    zIndex: number = 0;

    @SceneChangeDetection({
        redraw: RedrawType.TRIVIAL,
        changeCb: zIndexChangedCallback,
    })
    /** Discriminators for render order within a zIndex. */
    zIndexSubOrder?: [string, number] = undefined;

    pointerEvents: PointerEvents = PointerEvents.All;

    get nodeCount() {
        let count = 1;
        let dirtyCount = this._dirty >= RedrawType.NONE || this._dirtyTransform ? 1 : 0;
        let visibleCount = this.visible ? 1 : 0;

        for (const child of this._children) {
            const { count: childCount, visibleCount: childVisibleCount, dirtyCount: childDirtyCount } = child.nodeCount;
            count += childCount;
            visibleCount += childVisibleCount;
            dirtyCount += childDirtyCount;
        }

        return { count, visibleCount, dirtyCount };
    }

    protected zIndexChanged() {
        // Override point for sub-classes.
    }
}
