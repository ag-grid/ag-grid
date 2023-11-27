import { Node } from './node';
type NodeConstructor<TNode extends Node> = new () => TNode;
type NodeFactory<TNode extends Node, TDatum> = (datum: TDatum) => TNode;
type NodeConstructorOrFactory<TNode extends Node, TDatum> = NodeConstructor<TNode> | NodeFactory<TNode, TDatum>;
export declare class Selection<TChild extends Node = Node, TDatum = any> {
    private readonly parentNode;
    private readonly autoCleanup;
    static select<TChild extends Node = Node, TDatum = any>(parent: Node, classOrFactory: NodeConstructorOrFactory<TChild, TDatum>, garbageCollection?: boolean): Selection<TChild, TDatum>;
    static selectAll<TChild extends Node = Node>(parent: Node, predicate: (node: Node) => node is TChild): TChild[];
    static selectByClass<TChild extends Node = Node>(node: Node, Class: new () => TChild): TChild[];
    static selectByTag<TChild extends Node = Node>(node: Node, tag: number): TChild[];
    private readonly nodeFactory;
    private readonly garbageBin;
    protected _nodesMap: Map<TChild, string | number>;
    protected _nodes: TChild[];
    protected data: TDatum[];
    private debug;
    constructor(parentNode: Node, classOrFactory: NodeConstructorOrFactory<TChild, TDatum>, autoCleanup?: boolean);
    private createNode;
    /**
     * Update the data in a selection. If an `getDatumId()` function is provided, maintain a list of ids related to
     * the nodes. Otherwise, take the more efficient route of simply creating and destroying nodes at the end
     * of the array.
     */
    update(data: TDatum[], initializer?: (node: TChild) => void, getDatumId?: (datum: TDatum) => string | number): this;
    cleanup(): this;
    clear(): this;
    isGarbage(node: TChild): boolean;
    hasGarbage(): boolean;
    each(iterate: (node: TChild, datum: TDatum, index: number) => void): this;
    [Symbol.iterator](): IterableIterator<{
        node: TChild;
        datum: TDatum;
        index: number;
    }>;
    select<TChild extends Node = Node>(predicate: (node: Node) => node is TChild): TChild[];
    selectByClass<TChild extends Node = Node>(Class: new () => TChild): TChild[];
    selectByTag<TChild extends Node = Node>(tag: number): TChild[];
    nodes(): TChild[];
}
export {};
