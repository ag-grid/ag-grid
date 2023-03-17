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
    select<T extends Node = Node>(predicate: (node: Node) => boolean): T[];
    selectByClass<T extends Node = Node>(Class: new () => T): T[];
    selectByTag<T extends Node = Node>(tag: number): T[];
    nodes(): TChild[];
}
export {};
