import { Node } from './node';

type NodeConstructor<TNode extends Node> = new () => TNode;
type NodeFactory<TNode extends Node, TDatum> = (datum: TDatum) => TNode;
type NodeConstructorOrFactory<TNode extends Node, TDatum> = NodeConstructor<TNode> | NodeFactory<TNode, TDatum>;

export class Selection<TChild extends Node = Node, TDatum = any> {
    constructor(
        parent: Node,
        classOrFactory: NodeConstructorOrFactory<TChild, TDatum>,
        garbageCollection: boolean = true
    ) {
        this._parent = parent;
        this._factory = Object.prototype.isPrototypeOf.call(Node, classOrFactory)
            ? () => new (classOrFactory as NodeConstructor<TChild>)()
            : (classOrFactory as NodeFactory<TChild, TDatum>);
        this._garbageCollection = garbageCollection;
    }

    static select<TChild extends Node = Node, TDatum = any>(
        parent: Node,
        classOrFactory: NodeConstructorOrFactory<TChild, TDatum>,
        garbageCollection: boolean = true
    ) {
        return new Selection(parent, classOrFactory, garbageCollection);
    }

    private _parent: Node;
    private _nodes: TChild[] = [];
    private _data: TDatum[] = [];
    private _ids: string[] = [];
    private _factory: NodeFactory<TChild, TDatum>;

    // If garbage collection is set to false, you must call `selection.cleanup()` to remove deleted nodes
    private _garbage: number[] = [];
    private _garbageCollection: boolean = true;

    each(iterate: (node: TChild, datum: TDatum, index: number) => void) {
        this._nodes.forEach((node, i) => iterate(node, node.datum, i));
        return this;
    }

    /**
     * Update the data in a selection. If an `id()` function is provided, maintain a list of ids related to the nodes.
     * Otherwise, take the more efficient route of simply creating and destroying nodes at the end of the array.
     */
    update(data: TDatum[], init?: (node: TChild) => void, getDatumId?: (datum: TDatum) => string) {
        const old = this._data;
        const parent = this._parent;
        const factory = this._factory;

        if (getDatumId) {
            // Append any new datum ids and nodes to the end of the arrays
            data.forEach((datum) => {
                const datumId = getDatumId(datum);
                if (this._ids.indexOf(datumId) === -1) {
                    this._ids.push(datumId);

                    const node = factory(datum);
                    node.datum = datum;
                    init?.(node);
                    parent.appendChild(node);
                    this._nodes.push(node);
                }
            });
        } else if (data.length > old.length) {
            // Create and append nodes for new data
            data.slice(old.length).forEach((datum) => {
                const node = factory(datum);
                node.datum = datum;
                init?.(node);
                parent.appendChild(node);
                this._nodes.push(node);
            });
        } else if (data.length < old.length) {
            // Destroy any nodes that are in excess of the new data
            this._nodes.splice(data.length).forEach((node) => {
                parent.removeChild(node);
            });
        }

        // Copy the data into a new array to prevent mutation and duplicates
        this._data = data.slice(0);

        if (getDatumId) {
            // Find and update the datum for each node by the index of the id within the set
            for (let i = 0; i < this._ids.length; i++) {
                const datum = this._data.find((d) => getDatumId(d) === this._ids[i]);
                if (datum) {
                    this._nodes[i].datum = datum;
                } else {
                    this._garbage.push(i);
                }
            }

            if (this._garbageCollection) {
                this.cleanup();
            }
        } else {
            // Reset the node data by index
            for (let i = 0; i < data.length; i++) {
                this._nodes[i].datum = this._data[i];
            }
        }

        return this;
    }

    clear() {
        this.update([]);
        return this;
    }

    cleanup() {
        if (this._garbage.length === 0) return;

        this._nodes = this._nodes.filter((node, index) => {
            if (this._garbage.indexOf(index) === -1) return true;

            delete this._ids[index];
            this._parent.removeChild(node);
            return false;
        });

        this._ids = this._ids.filter((id) => id !== undefined);
        this._garbage = [];
    }

    static selectAll<T extends Node = Node>(parent: Node, predicate: (node: Node) => boolean): T[] {
        const results: T[] = [];
        const traverse = (node: Node) => {
            if (predicate(node)) {
                results.push(node as T);
            }
            node.children.forEach(traverse);
        };
        traverse(parent);
        return results;
    }

    static selectByClass<T extends Node = Node>(node: Node, Class: new () => T): T[] {
        return Selection.selectAll(node, (node) => node instanceof Class);
    }

    static selectByTag<T extends Node = Node>(node: Node, tag: number): T[] {
        return Selection.selectAll(node, (node) => node.tag === tag);
    }

    select<T extends Node = Node>(predicate: (node: Node) => boolean): T[] {
        return Selection.selectAll(this._parent, predicate);
    }

    selectByClass<T extends Node = Node>(Class: new () => T): T[] {
        return this.select((node) => node instanceof Class);
    }

    selectByTag<T extends Node = Node>(tag: number): T[] {
        return this.select((node) => node.tag === tag);
    }

    nodes() {
        return this._nodes;
    }
}
