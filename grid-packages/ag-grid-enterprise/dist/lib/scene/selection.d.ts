import { Node } from './node';
declare type NodeConstructor<TNode extends Node> = new () => TNode;
declare type NodeFactory<TNode extends Node, TDatum> = (datum: TDatum) => TNode;
declare type NodeConstructorOrFactory<TNode extends Node, TDatum> = NodeConstructor<TNode> | NodeFactory<TNode, TDatum>;
export declare class Selection<TChild extends Node = Node, TDatum = any> {
    constructor(parent: Node, classOrFactory: NodeConstructorOrFactory<TChild, TDatum>, garbageCollection?: boolean);
    static select<TChild extends Node = Node, TDatum = any>(parent: Node, classOrFactory: NodeConstructorOrFactory<TChild, TDatum>, garbageCollection?: boolean): Selection<TChild, TDatum>;
    private _parent;
    private _nodes;
    private _data;
    private _datumNodeIndices;
    private _factory;
    private _garbage;
    private _garbageCollection;
    each(iterate: (node: TChild, datum: TDatum, index: number) => void): this;
    /**
     * Update the data in a selection. If an `getDatumId()` function is provided, maintain a list of ids related to
     * the nodes. Otherwise, take the more efficient route of simply creating and destroying nodes at the end
     * of the array.
     */
    update(data: TDatum[], init?: (node: TChild) => void, getDatumId?: (datum: TDatum) => string | number): this;
    clear(): this;
    cleanup(): void;
    static selectAll<T extends Node = Node>(parent: Node, predicate: (node: Node) => boolean): T[];
    static selectByClass<T extends Node = Node>(node: Node, Class: new () => T): T[];
    static selectByTag<T extends Node = Node>(node: Node, tag: number): T[];
    select<T extends Node = Node>(predicate: (node: Node) => boolean): T[];
    selectByClass<T extends Node = Node>(Class: new () => T): T[];
    selectByTag<T extends Node = Node>(tag: number): T[];
    nodes(): TChild[];
}
export {};
//# sourceMappingURL=selection.d.ts.map