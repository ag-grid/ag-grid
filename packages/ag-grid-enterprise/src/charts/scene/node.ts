import {Scene} from "./scene";
import {Matrix} from "./matrix";

/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
export abstract class Node { // Don't confuse with `window.Node`.

    // Uniquely identify nodes (to check for duplicates, for example).
    private static id = 1;
    private createId(): string {
        return (this.constructor as any).name + '-' + (Node.id++);
    };
    readonly id: string = this.createId();

    datum: any;

    static isNode(node: any): node is Node {
        return node ? (node as Node).matrix !== undefined : false;
    }

    protected _scene: Scene | null = null;
    _setScene(value: Scene | null) {
        this._scene = value;

        const children = this.children;
        const n = children.length;

        for (let i = 0; i < n; i++) {
            children[i]._setScene(value);
        }
    }
    get scene(): Scene | null {
        return this._scene;
    }

    private _parent: Node | null = null;
    _setParent(value: Node | null) {
        this._parent = value;
    }
    get parent(): Node | null {
        return this._parent;
    }

    private _children: Node[] = [];
    get children(): ReadonlyArray<Node> {
        return this._children;
    }

    private static MAX_SAFE_INTEGER = Math.pow(2, 53) - 1; // Number.MAX_SAFE_INTEGER

    countChildren(depth = Node.MAX_SAFE_INTEGER): number {
        if (depth <= 0)
            return 0;

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
                node._setParent(null);
                node._setScene(null);
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
        }
        else {
            this.append(node);
        }

        return node;
    }

    // These matrices may need to have package level visibility
    // for performance optimization purposes.
    protected matrix = new Matrix();
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
     * Rotation in radians.
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

    protected computeTransformMatrix() {
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
        }
        else {
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
        }
        else {
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

    abstract render(ctx: CanvasRenderingContext2D): void

    /**
     * Determines the order of rendering of this node within its parent node.
     * By default the child nodes are rendered in the order in which they were added.
     */
    zIndex: number = 0;

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
    private _dirty = true;
    set dirty(dirty: boolean) {
        // TODO: check if we are already dirty (e.g. if (this._dirty !== dirty))
        //       if we are, then all parents and the scene have been
        //       notified already, and we are doing redundant work
        //       (but test if this is indeed the case)
        this._dirty = dirty;
        if (dirty) {
            if (this.parent) {
                this.parent.dirty = true;
            }
            else if (this.scene) {
                this.scene.dirty = true;
            }
        }
    }
    get dirty(): boolean {
        return this._dirty;
    }
}
