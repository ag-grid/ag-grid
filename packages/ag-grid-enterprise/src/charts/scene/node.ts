import { Scene } from "./scene";
import { Matrix } from "./matrix";
import { BBox } from "./bbox";

export enum PointerEvents {
    All,
    None
}

/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
export abstract class Node { // Don't confuse with `window.Node`.

    // Uniquely identify nodes (to check for duplicates, for example).
    private createId(): string {
        const constructor = this.constructor as any;
        const className = constructor.className;
        if (!className) {
            throw new Error(`The ${constructor} is missing the 'className' property.`);
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    }

    /**
     * Unique node ID in the form `ClassName-NaturalNumber`.
     */
    readonly id: string = this.createId();

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

    protected _scene?: Scene;
    _setScene(value?: Scene) {
        this._scene = value;

        const children = this.children;
        const n = children.length;

        for (let i = 0; i < n; i++) {
            children[i]._setScene(value);
        }
    }
    get scene(): Scene | undefined {
        return this._scene;
    }

    private _parent?: Node;
    _setParent(value?: Node) {
        this._parent = value;
    }
    get parent(): Node | undefined {
        return this._parent;
    }

    private _children: Node[] = [];
    get children(): ReadonlyArray<Node> {
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
        // The function takes an array rather than having open-ended
        // arguments like `...nodes: Node[]` because the latter is
        // transpiled to a function where the `arguments` object
        // is copied to a temporary array inside a loop.
        // So an array is created either way. And if we already have
        // an array of nodes we want to add, we have to use the prohibitively
        // expensive spread operator to pass it to the function,
        // and, on top of that, the copy of the `arguments` is still made.
        const n = nodes.length;

        for (let i = 0; i < n; i++) {
            const node = nodes[i];

            if (node.parent) {
                throw new Error(`${node} already belongs to another parent: ${node.parent}.`);
            }
            if (node.scene) {
                throw new Error(`${node} already belongs a scene: ${node.scene}.`);
            }
            if (this.childSet[node.id]) {
                // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                throw new Error(`Duplicate ${(node.constructor as any).name} node: ${node}`);
            }

            this._children.push(node);
            this.childSet[node.id] = true;

            node._setParent(this);
            node._setScene(this.scene);
        }

        this.dirty = true;
    }

    appendChild<T extends Node>(node: T): T {
        if (node.parent) {
            throw new Error(`${node} already belongs to another parent: ${node.parent}.`);
        }
        if (node.scene) {
            throw new Error(`${node} already belongs a scene: ${node.scene}.`);
        }
        if (this.childSet[node.id]) {
            // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
            throw new Error(`Duplicate ${(node.constructor as any).name} node: ${node}`);
        }

        this._children.push(node);
        this.childSet[node.id] = true;

        node._setParent(this);
        node._setScene(this.scene);

        this.dirty = true;

        return node;
    }

    removeChild<T extends Node>(node: T): T {
        if (node.parent === this) {
            const i = this.children.indexOf(node);

            if (i >= 0) {
                this._children.splice(i, 1);
                delete this.childSet[node.id];
                node._setParent(undefined);
                node._setScene(undefined);
                this.dirty = true;

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
                node._setParent(this);
                node._setScene(this.scene);
            } else {
                throw new Error(`${nextNode} has ${parent} as the parent, `
                    + `but is not in its list of children.`);
            }

            this.dirty = true;
        } else {
            this.append(node);
        }

        return node;
    }

    // These matrices may need to have package level visibility
    // for performance optimization purposes.
    matrix = new Matrix();
    protected inverseMatrix = new Matrix();

    /**
     * Calculates the combined inverse transformation for this node,
     * and uses it to convert the given transformed point
     * to the untransformed one.
     * @param x
     * @param y
     */
    transformPoint(x: number, y: number) {
        const matrix = Matrix.flyweight(this.matrix);

        let parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }

        return matrix.invertSelf().transformPoint(x, y);
    }

    // TODO: should this be `true` by default as well?
    private _dirtyTransform = false;
    set dirtyTransform(value: boolean) {
        this._dirtyTransform = value;
        // TODO: replace this with simply `this.dirty = true`,
        //       see `set dirty` method.
        if (value) {
            this.dirty = true;
        }
    }
    get dirtyTransform(): boolean {
        return this._dirtyTransform;
    }

    private _scalingX: number = 1;
    set scalingX(value: number) {
        if (this._scalingX !== value) {
            this._scalingX = value;
            this.dirtyTransform = true;
        }
    }
    get scalingX(): number {
        return this._scalingX;
    }

    private _scalingY: number = 1;
    set scalingY(value: number) {
        if (this._scalingY !== value) {
            this._scalingY = value;
            this.dirtyTransform = true;
        }
    }
    get scalingY(): number {
        return this._scalingY;
    }

    /**
     * The center of scaling.
     * The default value of `null` means the scaling center will be
     * determined automatically, as the center of the bounding box
     * of a node.
     */
    private _scalingCenterX: number | null = null;
    set scalingCenterX(value: number | null) {
        if (this._scalingCenterX !== value) {
            this._scalingCenterX = value;
            this.dirtyTransform = true;
        }
    }
    get scalingCenterX(): number | null {
        return this._scalingCenterX;
    }

    private _scalingCenterY: number | null = null;
    set scalingCenterY(value: number | null) {
        if (this._scalingCenterY !== value) {
            this._scalingCenterY = value;
            this.dirtyTransform = true;
        }
    }
    get scalingCenterY(): number | null {
        return this._scalingCenterY;
    }

    private _rotationCenterX: number | null = null;
    set rotationCenterX(value: number | null) {
        if (this._rotationCenterX !== value) {
            this._rotationCenterX = value;
            this.dirtyTransform = true;
        }
    }
    get rotationCenterX(): number | null {
        return this._rotationCenterX;
    }

    private _rotationCenterY: number | null = null;
    set rotationCenterY(value: number | null) {
        if (this._rotationCenterY !== value) {
            this._rotationCenterY = value;
            this.dirtyTransform = true;
        }
    }
    get rotationCenterY(): number | null {
        return this._rotationCenterY;
    }

    /**
     * Rotation angle in radians.
     * The value is set as is. No normalization to the [-180, 180) or [0, 360)
     * interval is performed.
     */
    private _rotation: number = 0;
    set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this.dirtyTransform = true;
        }
    }
    get rotation(): number {
        return this._rotation;
    }

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
        this.rotation = value / 180 * Math.PI;
    }
    get rotationDeg(): number {
        return this.rotation / Math.PI * 180;
    }

    private _translationX: number = 0;
    set translationX(value: number) {
        if (this._translationX !== value) {
            this._translationX = value;
            this.dirtyTransform = true;
        }
    }
    get translationX(): number {
        return this._translationX;
    }

    private _translationY: number = 0;
    set translationY(value: number) {
        if (this._translationY !== value) {
            this._translationY = value;
            this.dirtyTransform = true;
        }
    }
    get translationY(): number {
        return this._translationY;
    }

    isPointInNode(x: number, y: number): boolean {
        return false;
    }

    /**
     * Hit testing method.
     * Recursively checks if the given point is inside this node or any of its children.
     * Returns the first matching node or `undefined`.
     * Nodes that render later (show on top) are hit tested first.
     * @param x
     * @param y
     */
    pickNode(x: number, y: number): Node | undefined {
        if (!this.visible || this.pointerEvents === PointerEvents.None || !this.isPointInNode(x, y)) {
            return;
        }

        const children = this.children;

        if (children.length) {
            // Nodes added later should be hit-tested first,
            // as they are rendered on top of the previously added nodes.
            for (let i = children.length - 1; i >= 0; i--) {
                const hit = children[i].pickNode(x, y);
                if (hit) {
                    return hit;
                }
            }
        } else if (!this.isContainerNode) { // a leaf node, but not a container leaf
            return this;
        }
    }

    getBBox(): BBox | undefined { return; }

    getBBoxCenter(): [number, number] {
        const bbox = this.getBBox && this.getBBox();
        if (bbox) {
            return [
                bbox.x + bbox.width * 0.5,
                bbox.y + bbox.height * 0.5
            ];
        }
        return [0, 0];
    }

    computeTransformMatrix() {
        // TODO: transforms without center of scaling and rotation correspond directly
        //       to `setAttribute('transform', 'translate(tx, ty) rotate(rDeg) scale(sx, sy)')`
        //       in SVG. Our use cases will mostly require positioning elements (rects, circles)
        //       within a group, rotating groups at right angles (e.g. for axis) and translating
        //       groups. We shouldn't even need `scale(1, -1)` (invert vertically), since this
        //       can be done using D3-like scales already by inverting the output range.
        //       So for now, just assume that centers of scaling and rotation are at the origin.
        // const [bbcx, bbcy] = this.getBBoxCenter();
        const [bbcx, bbcy] = [0, 0];

        const sx = this.scalingX;
        const sy = this.scalingY;
        let scx: number;
        let scy: number;

        if (sx === 1 && sy === 1) {
            scx = 0;
            scy = 0;
        } else {
            scx = this.scalingCenterX === null ? bbcx : this.scalingCenterX;
            scy = this.scalingCenterY === null ? bbcy : this.scalingCenterY;
        }

        const r = this.rotation;
        const cos = Math.cos(r);
        const sin = Math.sin(r);
        let rcx: number;
        let rcy: number;

        if (r === 0) {
            rcx = 0;
            rcy = 0;
        } else {
            rcx = this.rotationCenterX === null ? bbcx : this.rotationCenterX;
            rcy = this.rotationCenterY === null ? bbcy : this.rotationCenterY;
        }

        const tx = this.translationX;
        const ty = this.translationY;

        // The transform matrix `M` is a result of the following transformations:
        // 1) translate the center of scaling to the origin
        // 2) scale
        // 3) translate back
        // 4) translate the center of rotation to the origin
        // 5) rotate
        // 6) translate back
        // 7) translate
        //         (7)          (6)             (5)             (4)           (3)           (2)           (1)
        //     | 1 0 tx |   | 1 0 rcx |   | cos -sin 0 |   | 1 0 -rcx |   | 1 0 scx |   | sx 0 0 |   | 1 0 -scx |
        // M = | 0 1 ty | * | 0 1 rcy | * | sin  cos 0 | * | 0 1 -rcy | * | 0 1 scy | * | 0 sy 0 | * | 0 1 -scy |
        //     | 0 0  1 |   | 0 0  1  |   |  0    0  1 |   | 0 0  1   |   | 0 0  1  |   | 0  0 0 |   | 0 0  1   |

        // Translation after steps 1-4 above:
        const tx4 = scx * (1 - sx) - rcx;
        const ty4 = scy * (1 - sy) - rcy;

        this.dirtyTransform = false;

        this.matrix.setElements([
            cos * sx, sin * sx,
            -sin * sy, cos * sy,
            cos * tx4 - sin * ty4 + rcx + tx,
            sin * tx4 + cos * ty4 + rcy + ty
        ]).inverseTo(this.inverseMatrix);
    }

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
    private _dirty = true;
    set dirty(value: boolean) {
        // TODO: check if we are already dirty (e.g. if (this._dirty !== value))
        //       if we are, then all parents and the scene have been
        //       notified already, and we are doing redundant work
        //       (but test if this is indeed the case)
        this._dirty = value;
        if (value) {
            if (this.parent) {
                this.parent.dirty = true;
            } else if (this.scene) {
                this.scene.dirty = true;
            }
        }
    }
    get dirty(): boolean {
        return this._dirty;
    }

    private _visible: boolean = true;
    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this.dirty = true;
        }
    }
    get visible(): boolean {
        return this._visible;
    }

    pointerEvents: PointerEvents = PointerEvents.All;
}
