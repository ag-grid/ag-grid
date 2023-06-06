import { Node } from './node';
declare type NodeConstructor<TNode extends Node> = new () => TNode;
declare type NodeFactory<TNode extends Node, TDatum> = (datum: TDatum) => TNode;
declare type NodeConstructorOrFactory<TNode extends Node, TDatum> = NodeConstructor<TNode> | NodeFactory<TNode, TDatum>;
export declare class Selection<TChild extends Node = Node, TDatum = any> {
    constructor(parent: Node, classOrFactory: NodeConstructorOrFactory<TChild, TDatum>);
    static select<TChild extends Node = Node, TDatum = any>(parent: Node, classOrFactory: NodeConstructorOrFactory<TChild, TDatum>): Selection<TChild, TDatum>;
    private _parent;
    private _nodes;
    private _data;
    private _factory;
    each(iterate: (node: TChild, datum: TDatum, index: number) => void): this;
    update(data: TDatum[], init?: (node: TChild) => void): this;
    clear(): this;
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