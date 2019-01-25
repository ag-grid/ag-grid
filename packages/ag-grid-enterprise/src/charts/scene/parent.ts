import {Node} from "./node";
import {Scene} from "./scene";

/**
 * Abstract parent node.
 * Each parent can have zero or more children.
 */
export abstract class Parent extends Node {
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

    // Used to check for duplicate nodes.
    private childSet: { [id: string]: boolean } = {}; // new Set<Node>()

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

    removeChild<T extends Node>(node: T): T {
        if (node.parent === this) {
            const i = this.children.indexOf(node);

            if (i >= 0) {
                this._children.splice(i, 1);
                delete this.childSet[node.id];
                node.parent = null;
                node.scene = null;
                this.dirty = true;

                return node;
            }
        }
        throw new Error(`The node to be removed is not a child of this node.`);
    }

    /**
     * Inserts the node `newChild` before the existing child node `refChild`.
     * If `refChild` is null, insert `newChild` at the end of the list of children.
     * @param newChild
     * @param refChild
     */
    insertBefore<T extends Node>(newChild: T, refChild?: Node | null): T {
        // If the `newChild` is already in the tree, it is first removed.
        const parent = newChild.parent;
        if (newChild.parent) {
            newChild.parent.removeChild(newChild);
        }

        if (refChild && refChild.parent === this) {
            const i = this.children.indexOf(refChild);
            if (i >= 0) {
                this._children.splice(i, 0, newChild);
                this.childSet[newChild.id] = true;
                newChild.parent = this;
                newChild.scene = this.scene;
            } else {
                throw new Error(`${refChild} has ${parent} as the parent, `
                    + `but is not in its list of children.`);
            }

            this.dirty = true;
        }
        else {
            this.addAll([newChild]);
        }

        return newChild;
    }
}
