import {Node} from "./node";
import {Scene} from "./scene";

/**
 * Abstract parent node.
 * Each parent can have zero or more children.
 */
export abstract class Parent extends Node {
    _setScene(value: Scene | null) {
        this._scene = value;

        const children = this.children;
        const n = children.length;

        for (let i = 0; i < n; i++) {
            children[i]._setScene(value);
        }
    }

    static isParent(node: {}): node is Parent {
        return (node as Parent).children !== undefined;
    }

    private _children: Node[] = [];
    get children(): ReadonlyArray<Node> {
        return this._children;
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
}
