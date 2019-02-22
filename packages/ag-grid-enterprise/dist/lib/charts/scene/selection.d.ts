// ag-grid-enterprise v20.1.0
import { Node } from "./node";
import { Scene } from "./scene";
declare type ValueFn<P, GDatum, PDatum> = (parent: P, data: PDatum, index: number, groups: (P | undefined)[]) => GDatum[];
declare type KeyFn<N, G, GDatum> = (node: N, datum: GDatum, index: number, groups: (G | undefined)[]) => string;
export declare class EnterNode {
    constructor(parent: Node | EnterNode, datum: any);
    scene: Scene | null;
    parent: Node | EnterNode;
    datum: any;
    next: Node | EnterNode | null;
    appendChild<T extends Node>(node: T): T;
    insertBefore<T extends Node>(node: T, nextNode?: Node | null): T;
}
/**
 * G - type of the selected node(s).
 * GDatum - type of the datum of the selected node(s).
 * P - type of the parent node(s).
 * PDatum - type of the datum of the parent node(s).
 */
export declare class Selection<G extends Node | EnterNode, P extends Node | EnterNode, GDatum = any, PDatum = any> {
    constructor(groups: (G | undefined)[][], parents: (P | undefined)[]);
    groups: (G | undefined)[][];
    parents: (P | undefined)[];
    static select<G extends Node, P extends Node | EnterNode>(node: G | (() => G)): Selection<G, P, any, any>;
    static selectAll<G extends Node>(nodes?: G[] | null): Selection<G, Node | EnterNode, any, any>;
    /**
     * Creates new nodes, appends them to the nodes of this selection and returns them
     * as a new selection. The created nodes inherit the datums and the parents of the nodes
     * they replace.
     * @param Class The constructor function to use to create the new nodes.
     */
    append<N extends Node>(Class: new () => N): Selection<N, P, GDatum, GDatum>;
    /**
     * Same as the {@link append}, but accepts a custom creator function with the
     * {@link NodeSelector} signature rather than a constructor function.
     * @param creator
     */
    private appendFn;
    /**
     * Runs the given selector that returns a single node for every node in each group.
     * The original nodes are then replaced by the nodes returned by the selector
     * and returned as a new selection.
     * The selected nodes inherit the datums and the parents of the original nodes.
     */
    select<N extends Node>(selector: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => N | undefined): Selection<N, P, GDatum, GDatum>;
    /**
     * Same as {@link select}, but uses the given {@param Class} (constructor) as a selector.
     * @param Class The constructor function to use to find matching nodes.
     */
    selectByClass<N extends Node>(Class: new () => N): Selection<N, P, GDatum, GDatum>;
    selectByTag<N extends Node>(tag: number): Selection<N, P, GDatum, GDatum>;
    private selectNone;
    /**
     * Runs the given selector that returns a group of nodes for every node in each group.
     * The original nodes are then replaced by the groups of nodes returned by the selector
     * and returned as a new selection. The original nodes become the parent nodes for each
     * group in the new selection. The selected nodes do not inherit the datums of the original nodes.
     */
    selectAll<N extends Node, NDatum = any>(selectorAll?: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => N[]): Selection<N, G, NDatum, GDatum>;
    /**
     * Runs the given callback for every node in the selection.
     * @param cb
     */
    each(cb: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => void): this;
    remove(): this;
    merge(other: Selection<G, P, GDatum, PDatum>): Selection<G, P, GDatum, PDatum>;
    node(): G | null;
    attr<K extends keyof G>(name: K, value: Exclude<G[K], Function>): this;
    attrFn<K extends keyof G>(name: K, value: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => Exclude<G[K], Function>): this;
    call(cb: (selection: this) => void): this;
    readonly size: number;
    readonly data: GDatum[];
    private enterGroups?;
    private exitGroups?;
    readonly enter: Selection<EnterNode, P, GDatum, PDatum>;
    readonly exit: Selection<G, P, GDatum, PDatum>;
    setDatum<GDatum>(value: GDatum): Selection<G, P, GDatum, PDatum>;
    setData<GDatum>(value: GDatum[] | ValueFn<P, GDatum, PDatum>, key?: KeyFn<Node | EnterNode, G | GDatum, GDatum>): Selection<G, P, GDatum, PDatum>;
    private bindIndex;
    private static keyPrefix;
    private bindKey;
}
export {};
