import {Scene} from "./scene";

/**
 * Abstract scene graph node.
 * Each node can have zero or more children, zero or one parent
 * and belong to zero or one scene.
 */
export abstract class Node { // Don't confuse with `window.Node`.

    // Uniquely identify nodes (to check for duplicates, for example).
    private static id = 1;
    private createId(): string {
        return (this.constructor as any).name + '-' + (Node.id++);
    };
    readonly id: string = this.createId();

    private _scene?: Scene;
    set scene(value: Scene | undefined) {
        this._scene = value;
        this.children.forEach(child => child.scene = value);
    }
    get scene(): Scene | undefined {
        return this._scene;
    }

    private _parent?: Node;
    set parent(value: Node | undefined) {
        this._parent = value;
    }
    get parent(): Node | undefined {
        return this._parent;
    }

    private _children: Node[] = [];
    get children(): Node[] {
        return this._children;
    }

    // Used to check for duplicate nodes.
    private childSet: { [key in string]: boolean } = {}; // new Set<Node>()

    add(...args: Node[]) {
        args.forEach(node => {
            if (!this.childSet[node.id]) {
                this._children.push(node);
                this.childSet[node.id] = true;

                node.parent = this;
                node.scene = this.scene;
            }
            else {
                // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                throw new Error(`Duplicate ${(node.constructor as any).name} node: ${node}`);
            }
        });
    }

    abstract render(ctx: CanvasRenderingContext2D): void

    /**
     * Determines the order of rendering of this node within the parent node.
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
    private _dirty = false;
    set dirty(dirty: boolean) {
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

    /*

    As of end of 2018:

    DOMMatrix !== SVGMatrix but
    DOMMatrix.constructor === SVGMatrix.constructor

    This works in Chrome and Safari:

    const p1 = new Path2D();
    const p2 = new Path2D();
    const m = new DOMMatrix();
    p1.addPath(p2, m);

    Firefox - TypeError: Argument 2 of Path2D.addPath does not implement interface SVGMatrix.
    See: https://bugzilla.mozilla.org/show_bug.cgi?id=1514538

    Edge - doesn't have DOMMatrix.
    IE11 - game over.

     */

    private static svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    static createSvgMatrix(): SVGMatrix {
        return Node.svg.createSVGMatrix();
    }

    static createSvgMatrixFrom(a: number, b: number,
                               c: number, d: number,
                               e: number, f: number): SVGMatrix {
        const m = Node.svg.createSVGMatrix();
        m.a = a;
        m.b = b;
        m.c = c;
        m.d = d;
        m.e = e;
        m.f = f;
        return m;
    }

    static createDomMatrix(a: number, b: number,
                           c: number, d: number,
                           e: number, f: number): DOMMatrix {
        const m = new DOMMatrix();
        m.a = a;
        m.b = b;
        m.c = c;
        m.d = d;
        m.e = e;
        m.f = f;
        return m;
    }
}
