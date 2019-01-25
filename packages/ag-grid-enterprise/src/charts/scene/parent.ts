import {Node} from "./node";
import {Scene} from "./scene";

/**
 * Abstract parent node.
 * Each parent can have zero or more children.
 */
export abstract class Parent extends Node {
    set scene(value: Scene | undefined) {
    set scene(value: Scene | null) {
        this._scene = value;

        const children = this.children;
        const n = children.length;
        for (let i = 0; i < n; i++) {
            children[i].scene = value;
        }
    }
    get scene(): Scene | null {
        return this._scene;
    }

    private _children: Node[] = [];
    get children(): ReadonlyArray<Node> {
        return this._children;
    }

    // Used to check for duplicate nodes or find a node's index by `id`.
    private childSet: { [id: string]: number } = {};

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
            if (node.scene && (node.scene !== this.scene)) {
                throw new Error(`Node ${node} already belongs to another scene, `
                    + `or its parent ${this} hasn't been assigned a scene yet.`);
            }
            if (isNaN(this.childSet[node.id])) {
                this._children.push(node);
                this.childSet[node.id] = this._children.length - 1;

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

    insertBefore<T extends Node>(newChild: T, refChild?: Node | null): T {
        if (newChild.scene && (newChild.scene !== this.scene)) {
            throw new Error(`Cannot move ${newChild} from ${newChild.scene} to ${this.scene}`);
        }

        const i = refChild && this.childSet[refChild.id];
        const parent = newChild.parent;

        // If the newChild is already in the tree, it is first removed.
        if (parent) {
            const j = parent.childSet[newChild.id];
            if (j >= 0) {
                parent._children.splice(j, 1);
            } else {
                throw new Error(`${newChild} has ${parent} as the parent, `
                    + `but is not in its list of children.`);
            }
        }
        if (i != null && i >= 0) {
            this._children.splice(i, 0, newChild);
            newChild.parent = this;
            newChild.scene = this.scene;
        }
        else {
            this.addAll([newChild]);
        }

        return newChild;
    }
}
