import {Node} from "./node";
import {Parent} from "./parent";
import {Scene} from "./scene";

interface ISelectionNode<T = any> {
    datum: any;
    readonly scene: Scene | null;

    readonly parent?: Parent | null;
    appendChild?<T extends Node>(node: T): T;
    insertBefore?<T extends Node>(node: T, nextNode?: Node | null): T;

    next?: T | null;
}

export class EnterNode<P extends Node, G extends Node, D> {

    constructor(parent: P, datum: D) {
        this.scene = parent.scene;
        this.parent = parent;
        this.datum = datum;
    }

    scene: Scene | null;
    parent: P;
    datum: D;
    next: G | null = null;

    appendChild<T extends Node>(node: T): T {
        if (!Parent.isParent(this.parent)) {
            throw new Error(`${this.parent} cannot have any children.`);
        }
        return this.parent.insertBefore(node, this.next);
    }

    insertBefore<T extends Node>(node: T, nextNode?: Node | null): T {
        if (!Parent.isParent(this.parent)) {
            throw new Error(`${this.parent} cannot have any children.`);
        }
        return this.parent.insertBefore(node, nextNode);
    }
}

/**
 * G - type of the selected node(s).
 * GDatum - type of the datum of the selected node(s).
 * P - type of the parent node(s).
 * PDatum - type of the datum of the parent node(s).
 */
export class Selection<G extends Node, P extends Node, GDatum = any, PDatum = any> {

    constructor(groups: G[][], parents: (P | null)[]) {
        this.groups = groups;
        this.parents = parents;
    }

    groups: (G | null)[][];
    parents: (P | null)[];

    private static root = [null];

    static select<T extends Node>(node: T | (() => T)) {
        return new Selection([[typeof node === 'function' ? node() : node]], Selection.root);
    }

    static selectAll<G extends Node>(nodes?: G[] | null) {
        return new Selection([nodes == null ? [] : nodes], Selection.root);
    }

    append<N extends Node>(Class: new () => N
           /*| ((this: Parent | EnterNode<P, G, any>, data: GDatum, index: number, parents: P[]) => G)*/): Selection<N, P, GDatum, PDatum> {
        // const node = new Class();
        // const create = typeof name === 'function' ? name : creator(name);
        // function create(): G {
        //     return new Class();
        // }
        // EnterNode<P, G, any>
        const sel = this.select(<P extends Node>(parent: P, data: GDatum, index: number, group: (G | null)[]): N => {
            // `parent` here can be `EnterNode`
            if (!Parent.isParent(parent)) {
                throw new Error(`${parent} is not a Parent node.`);
            }
            return parent.appendChild(new Class());
        });
        return sel;
    }

    select<N extends Node>(selector: <P extends Node>(parent: P, datum: GDatum, index: number, group: (G | null)[]) => N): Selection<N, P, GDatum, PDatum> {
        const groups = this.groups; // e.g. EnterNode[4][1] if called from 'append': d3.selectAll('tr').data([1,2,3,4]).enter().append('tr')
        const numGroups = groups.length;

        const subgroups: N[][] = [];

        for (let j = 0; j < numGroups; j++) {
            const group = groups[j]; // EnterNode[4]
            const groupSize = group.length; // 4
            const subgroup = subgroups[j] = new Array<N>(groupSize);

            for (let i = 0; i < groupSize; i++) {
                const node = group[i];

                if (node) {
                    const subnode = selector(node, node.datum, i, group);

                    if (subnode) {
                        subnode.datum = node.datum;
                    }
                    subgroup[i] = subnode;
                }
            }
        }

        return new Selection<N, P, GDatum, PDatum>(subgroups, this.parents);
    }

    private empty<T>(): T[] {
        return [];
    }

    selectAll<T extends Node>(selector?: <P extends Node>(parent: P, datum: GDatum, index: number, group: (G | null)[]) => T[]): Selection<T, G, GDatum, PDatum> {
        // T is the type of nodes the returned selection is supposed to contain.
        if (!selector) {
            selector = this.empty;
        }

        // Each subgroup is populated with the selector (run on each group node) results.
        const subgroups: T[][] = [];
        // In the new selection that we return, subgroups become groups,
        // and group nodes become parents.
        const parents: G[] = [];

        const groups = this.groups;
        const groupCount = groups.length;

        for (let j = 0; j < groupCount; j++) {
            const group = groups[j];
            const groupLength = group.length;

            for (let i = 0; i < groupLength; i++) {
                const node = group[i];

                if (node) {
                    subgroups.push(selector(node, node.datum, i, group));
                    parents.push(node);
                }
            }
        }

        return new Selection(subgroups, parents);
    }

    /**
     * Runs the given callback for every node in the selection.
     * @param cb
     */
    each(cb: (node: G, datum: GDatum, index: number, group: (G | null)[]) => void): this {
        const groups = this.groups;
        const numGroups = groups.length;

        for (let j = 0; j < numGroups; j++) {
            const group = groups[j];
            const groupSize = group.length;

            for (let i = 0; i < groupSize; i++) {
                const node = group[i];

                if (node) {
                    cb(node, node.datum as GDatum, i, group);
                }
            }
        }

        return this;
    }

    node(): G | null {
        const groups = this.groups;
        const numGroups = groups.length;

        for (let j = 0; j < numGroups; j++) {
            const group = groups[j];
            const groupSize = group.length;

            for (let i = 0; i < groupSize; i++) {
                const node = group[i];

                if (node) {
                    return node;
                }
            }
        }

        return null;
    }

    attr<K extends keyof G>(name: K, value: Exclude<G[K], Function>): this {
        this.each(node => {
            node[name] = value;
        });

        return this;
    }

    attrFn<K extends keyof G>(name: K, value: (node: G, datum: GDatum, index: number, group: (G | null)[]) => Exclude<G[K], Function>): this {
        this.each((node, datum, index, group) => {
            node[name] = value(node, datum, index, group);
        });

        return this;
    }

    call(cb: (selection: this) => void) {
        cb(this);

        return this;
    }

    get size(): number {
        let size = 0;
        this.each(() => size++);
        return size;
    }

    getData(): GDatum[] {
        const data: GDatum[] = [];
        let i = 0;

        this.each((_, datum) => data[i++] = datum);

        return data;
    }

    private _enterGroups?: EnterNode<P, G, GDatum>[][];
    private _exitGroups?: G[][];

    // get enter() {
    //     return new Selection(this._enterGroups!, this.parents);
    // }

    setDatum<GDatum>(value: GDatum): Selection<G, P, GDatum, PDatum> {
        const node = this.node();

        if (node) {
            node.datum = value;
        }

        return this as unknown as Selection<G, P, GDatum, PDatum>;
    }

    setData<GDatum>(value: GDatum[] | ((parent: P, data: PDatum, index: number, groups: (P | null)[]) => GDatum[]), key?: () => string) {
        if (typeof value !== 'function') {
            const data = value;
            value = () => data;
        }

        const groups = this.groups;
        const parents = this.parents;
        const numGroups = groups.length;
        const updateGroups: G[][] = new Array(numGroups);
        const enterGroups: EnterNode<P, G, GDatum>[][] = new Array<EnterNode<P, G, GDatum>[]>(numGroups);
        const exitGroups: G[][] = new Array(numGroups);

        for (let j = 0; j < numGroups; j++) {
            const group = groups[j];
            const parent = parents[j];

            if (!parent) {
                throw new Error(`Group #${j} has no parent: ${group}`);
            }

            const groupSize = group.length;
            const data: GDatum[] = value(parent, parent.datum, j, parents);
            const dataSize = data.length;

            const enterGroup = enterGroups[j] = new Array<EnterNode<P, G, GDatum>>(dataSize);
            const updateGroup = updateGroups[j] = new Array<G>(dataSize);
            const exitGroup = exitGroups[j] = new Array<G>(groupSize);

            if (key)
                this.bindKey(parent, group, enterGroup, updateGroup, exitGroup, data, key);
            else
                this.bindIndex(parent, group, enterGroup, updateGroup, exitGroup, data);

            // Now connect the enter nodes to their following update node, such that
            // appendChild can insert the materialized enter node before this node,
            // rather than at the end of the parent node.
            for (let i0 = 0, i1 = 0; i0 < dataSize; i0++) {
                const previous = enterGroup[i0];
                if (previous) {
                    if (i0 >= i1) {
                        i1 = i0 + 1;
                    }
                    let next;
                    while (!(next = updateGroup[i1]) && ++i1 < dataSize);
                    previous.next = next || null;
                }
            }
        }

        const result = new Selection<G, P, GDatum, PDatum>(updateGroups, parents);
        result._enterGroups = enterGroups;
        result._exitGroups = exitGroups;

        return result;
    }

    bindIndex<GDatum>(parent: P, group: (G | null)[],
              enterGroup: EnterNode<P, G, GDatum>[], updateGroup: G[], exitGroup: G[],
              data: GDatum[]) {
        const groupSize = group.length;
        const dataSize = data.length;

        let i = 0;

        for (; i < dataSize; i++) {
            const node = group[i];
            if (node) {
                node.datum = data[i];
                updateGroup[i] = node;
            } else {
                enterGroup[i] = new EnterNode(parent, data[i]);
            }
        }

        for (; i < groupSize; i++) {
            const node = group[i];
            if (node) {
                exitGroup[i] = node;
            }
        }
    }

    private static keyPrefix = '$'; // Protect against keys like '__proto__'.

    bindKey(parent: P, group: (G | null)[], enter: any, update: any, exit: any, data: any[],
            key: <T extends Node>(node: T, data: GDatum, index: number, groups: (G | null)[]) => string) {
        // Compute the key for each node.
        // If multiple nodes have the same key, the duplicates are added to exit.
        const groupSize = group.length;
        const dataSize = data.length;
        const keyValues = new Array(groupSize);
        const nodeByKeyValue: { [key: string]: G | null } = {};

        // Compute the key for each node.
        // If multiple nodes have the same key, the duplicates are added to exit.
        for (let i = 0; i < groupSize; i++) {
            const node = group[i];
            if (node) {
                const keyValue = keyValues[i] = Selection.keyPrefix + key(node, node.datum, i, group);
                if (keyValue in nodeByKeyValue)
                    exit[i] = node;
                else
                    nodeByKeyValue[keyValue] = node;
            }
        }

        // Compute the key for each datum.
        // If there a node associated with this key, join and add it to update.
        // If there is not (or the key is a duplicate), add it to enter.
        for (let i = 0; i < dataSize; i++) {
            const keyValue = Selection.keyPrefix + key(parent, data[i], i, data);
            const node = nodeByKeyValue[keyValue];
            if (node) {
                update[i] = node;
                node.datum = data[i];
                nodeByKeyValue[keyValue] = null;
            } else {
                enter[i] = new EnterNode(parent, data[i]);
            }
        }

        // Add any remaining nodes that were not bound to data to exit.
        for (let i = 0; i < groupSize; i++) {
            const node = group[i];
            if (node && (nodeByKeyValue[keyValues[i]] === node)) {
                exit[i] = node;
            }
        }
    }
}
