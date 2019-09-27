// ag-grid-enterprise v21.2.2
import { Node } from "./node";
import { Scene } from "./scene";
declare type ValueFn<P, GDatum, PDatum> = (parent: P, data: PDatum, index: number, groups: (P | undefined)[]) => GDatum[];
declare type KeyFn<N, G, GDatum> = (node: N, datum: GDatum, index: number, groups: (G | undefined)[]) => string;
export declare class EnterNode {
    constructor(parent: Node | EnterNode, datum: any);
    scene?: Scene;
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
    selectAllByClass<N extends Node, NDatum = any>(Class: new () => N): Selection<N, G, NDatum, GDatum>;
    selectAllByTag<N extends Node, NDatum = any>(tag: number): Selection<N, G, NDatum, GDatum>;
    private selectNone;
    /**
     * Runs the given selector that returns a group of nodes for every node in each group.
     * The original nodes are then replaced by the groups of nodes returned by the selector
     * and returned as a new selection. The original nodes become the parent nodes for each
     * group in the new selection. The selected nodes do not inherit the datums of the original nodes.
     * If called without any parameters, creates a new selection with an empty group for each
     * node in this selection.
     */
    selectAll<N extends Node, NDatum = any>(selectorAll?: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => N[]): Selection<N, G, NDatum, GDatum>;
    /**
     * Runs the given callback for every node in this selection and returns this selection.
     * @param cb
     */
    each(cb: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => void): this;
    remove(): this;
    merge(other: Selection<G, P, GDatum, PDatum>): Selection<G, P, GDatum, PDatum>;
    /**
     * Return the first non-null element in this selection.
     * If the selection is empty, returns null.
     */
    node(): G | null;
    attr<K extends keyof G>(name: K, value: Exclude<G[K], Function>): this;
    attrFn<K extends keyof G>(name: K, value: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => Exclude<G[K], Function>): this;
    /**
     * Invokes the given function once, passing in this selection.
     * Returns this selection. Facilitates method chaining.
     * @param cb
     */
    call(cb: (selection: this) => void): this;
    /**
     * Returns the total number of nodes in this selection.
     */
    readonly size: number;
    /**
     * Returns the array of data for the selected elements.
     */
    readonly data: GDatum[];
    private enterGroups?;
    private exitGroups?;
    readonly enter: Selection<EnterNode, P, GDatum, PDatum>;
    readonly exit: Selection<G, P, GDatum, PDatum>;
    /**
     * Binds the given value to each selected node and returns this selection
     * with its {@link GDatum} type changed to the type of the given value.
     * This method doesn't compute a join and doesn't affect indexes or the enter and exit selections.
     * This method can also be used to clear bound data.
     * @param value
     */
    setDatum<GDatum>(value: GDatum): Selection<G, P, GDatum, PDatum>;
    /**
     * Returns the bound datum for the first non-null element in the selection.
     * This is generally useful only if you know the selection contains exactly one element.
     */
    readonly datum: GDatum;
    /**
     * Binds the specified array of values with the selected nodes, returning a new selection
     * that represents the _update_ selection: the nodes successfully bound to the values.
     * Also defines the {@link enter} and {@link exit} selections on the returned selection,
     * which can be used to add or remove the nodes to correspond to the new data.
     * The `values` is an array of values of a particular type, or a function that returns
     * an array of values for each group.
     * When values are assigned to the nodes, they are stored in the {@link Node.datum} property.
     * @param values
     * @param key
     */
    setData<GDatum>(values: GDatum[] | ValueFn<P, GDatum, PDatum>, key?: KeyFn<Node | EnterNode, G | GDatum, GDatum>): Selection<G, P, GDatum, PDatum>;
    private bindIndex;
    private static keyPrefix;
    private bindKey;
}
export {};
