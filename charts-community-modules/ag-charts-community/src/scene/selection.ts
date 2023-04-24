import { Node } from './node';

type NodeConstructor<TNode extends Node> = new () => TNode;
type NodeFactory<TNode extends Node, TDatum> = (datum: TDatum) => TNode;
type NodeConstructorOrFactory<TNode extends Node, TDatum> = NodeConstructor<TNode> | NodeFactory<TNode, TDatum>;

export class Selection<TChild extends Node = Node, TDatum = any> {
    constructor(parent: Node, classOrFactory: NodeConstructorOrFactory<TChild, TDatum>) {
        this._parent = parent;
        this._factory = Object.prototype.isPrototypeOf.call(Node, classOrFactory)
            ? () => new (classOrFactory as NodeConstructor<TChild>)()
            : (classOrFactory as NodeFactory<TChild, TDatum>);
    }

    static select<TChild extends Node = Node, TDatum = any>(
        parent: Node,
        classOrFactory: NodeConstructorOrFactory<TChild, TDatum>
    ) {
        return new Selection(parent, classOrFactory);
    }

    private _parent: Node;
    private _nodes: TChild[] = [];
    private _data: TDatum[] = [];
    private _factory: NodeFactory<TChild, TDatum>;

    each(iterate: (node: TChild, datum: TDatum, index: number) => void) {
        this._nodes.forEach((node, i) => iterate(node, node.datum, i));
        return this;
    }

    update(data: TDatum[], init?: (node: TChild) => void) {
        const old = this._data;
        const parent = this._parent;
        const factory = this._factory;

        if (data.length > old.length) {
            data.slice(old.length).forEach((datum) => {
                const node = factory(datum);
                node.datum = datum;
                init && init(node);
                parent.appendChild(node);
                this._nodes.push(node);
            });
        } else if (data.length < old.length) {
            this._nodes.splice(data.length).forEach((node) => {
                parent.removeChild(node);
            });
        }

        this._data = data.slice(0);
        for (let i = 0; i < data.length; i++) {
            this._nodes[i].datum = this._data[i];
        }

        return this;
    }

    clear() {
        this.update([]);
        return this;
    }

    select<T extends Node = Node>(predicate: (node: Node) => boolean): T[] {
        const results: T[] = [];
        const traverse = (node: Node) => {
            if (predicate(node)) {
                results.push(node as T);
            }
            node.children.forEach(traverse);
        };
        traverse(this._parent);
        return results;
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
