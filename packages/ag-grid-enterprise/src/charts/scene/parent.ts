import {Node} from "./node";
import {Scene} from "./scene";

/**
 * Abstract parent node.
 * Each parent can have zero or more children.
 */
export abstract class Parent extends Node {
    set scene(value: Scene | undefined) {
        this._scene = value;

        const children = this.children;
        const n = children.length;
        for (let i = 0; i < n; i++) {
            children[i].scene = value;
        }
    }
    get scene(): Scene | undefined {
        return this._scene;
    }

    private _children: Node[] = [];
    get children(): Node[] {
        return this._children;
    }

    // Used to check for duplicate nodes.
    private childSet: { [key in string]: boolean } = {}; // new Set<Node>()

    add(node: Node) {
        // Passing a single parameter to an open-ended version of `addAll`
        // would be 30-35% slower than this:
        // https://jsperf.com/array-vs-var-arg
        this.addAll([node]);
    }

    addAll(nodes: Node[]) {
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
        }
        this.dirty = true;
    }
}
