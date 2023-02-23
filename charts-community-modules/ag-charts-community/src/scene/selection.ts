import { LayerManager, Node } from './node';

type ValueFn<P, GDatum, PDatum> = (parent: P, data: PDatum, index: number, groups: (P | undefined)[]) => GDatum[];

class EnterNode {
    constructor(parent: Node | EnterNode, datum: any) {
        this.layerManager = parent.layerManager;
        this.parent = parent;
        this.datum = datum;
    }

    layerManager?: LayerManager;
    parent: Node | EnterNode;
    datum: any;
    next: Node | EnterNode | null = null;
    children = [];

    appendChild<T extends Node>(node: T): T {
        if (this.next === null) {
            return this.parent.insertBefore(node, null);
        }
        return this.parent.insertBefore(node, this.next as Node);
    }

    insertBefore<T extends Node>(node: T, nextNode?: Node | null): T {
        return this.parent.insertBefore(node, nextNode);
    }

    removeChild() {}
}

/**
 * G - type of the selected node(s).
 * GDatum - type of the datum of the selected node(s).
 * P - type of the parent node(s).
 * PDatum - type of the datum of the parent node(s).
 */
export class Selection<G extends Node | EnterNode, P extends Node | EnterNode, GDatum = any, PDatum = any> {
    constructor(groups: (G | undefined)[][], parents: (P | undefined)[]) {
        this.groups = groups;
        this.parents = parents;
    }

    private groups: (G | undefined)[][];
    private parents: (P | undefined)[];

    static select<G extends Node, P extends Node | EnterNode>(node: G | (() => G)) {
        return new Selection<G, P>([[typeof node === 'function' ? node() : node]], [undefined]);
    }

    /**
     * Creates new nodes, appends them to the nodes of this selection and returns them
     * as a new selection. The created nodes inherit the datums and the parents of the nodes
     * they replace.
     * @param Class The constructor function to use to create the new nodes.
     */
    append<N extends Node>(Class: new () => N): Selection<N, P, GDatum, GDatum> {
        return this.select<N>((node) => {
            return node.appendChild(new Class());
        });
    }

    /**
     * Runs the given selector that returns a single node for every node in each group.
     * The original nodes are then replaced by the nodes returned by the selector
     * and returned as a new selection.
     * The selected nodes inherit the datums and the parents of the original nodes.
     */
    private select<N extends Node>(
        selector: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => N | undefined
    ): Selection<N, P, GDatum, GDatum> {
        const groups = this.groups;
        const numGroups = groups.length;

        const subgroups: (N | undefined)[][] = [];

        for (let j = 0; j < numGroups; j++) {
            const group = groups[j];
            const groupSize = group.length;
            const subgroup = (subgroups[j] = new Array<N | undefined>(groupSize));

            for (let i = 0; i < groupSize; i++) {
                const node = group[i];

                if (node) {
                    const subnode = selector(node, node.datum, i, group);

                    if (subnode) {
                        subnode.datum = node.datum;
                    }
                    subgroup[i] = subnode;
                }
                // else this can be a group of the `enter` selection,
                // for example, with no nodes at the i-th position,
                // only nodes at the end of the group
            }
        }

        return new Selection(subgroups, this.parents);
    }

    /**
     * Same as {@link select}, but uses the given {@param Class} (constructor) as a selector.
     * @param Class The constructor function to use to find matching nodes.
     */
    selectByClass<N extends Node>(Class: new () => N): Selection<N, P, GDatum, GDatum> {
        return this.select((node) => {
            const children = node.children;
            const n = children.length;

            for (let i = 0; i < n; i++) {
                const child = children[i];
                if (child instanceof Class) {
                    return child;
                }
            }
        });
    }

    selectByTag<N extends Node>(tag: number): Selection<N, P, GDatum, GDatum> {
        return this.select<N>((node) => {
            const children = node.children;
            const n = children.length;

            for (let i = 0; i < n; i++) {
                const child = children[i];
                if (child.tag === tag) {
                    return child as N;
                }
            }
        });
    }

    /**
     * Runs the given selector that returns a group of nodes for every node in each group.
     * The original nodes are then replaced by the groups of nodes returned by the selector
     * and returned as a new selection. The original nodes become the parent nodes for each
     * group in the new selection. The selected nodes do not inherit the datums of the original nodes.
     * If called without any parameters, creates a new selection with an empty group for each
     * node in this selection.
     */
    selectAll<N extends Node, NDatum = any>(
        selectorAll?: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => N[]
    ): Selection<N, G, NDatum, GDatum> {
        if (!selectorAll) {
            selectorAll = () => [];
        }

        // Each subgroup is populated with the selector (run on each group node) results.
        const subgroups: N[][] = [];
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
                    subgroups.push(selectorAll(node, node.datum, i, group));
                    parents.push(node);
                }
            }
        }

        return new Selection<N, G, NDatum, GDatum>(subgroups, parents);
    }

    /**
     * Runs the given callback for every node in this selection and returns this selection.
     * @param cb
     */
    each(cb: (node: G, datum: GDatum, index: number, group: (G | undefined)[]) => void): this {
        for (const group of this.groups) {
            let i = 0;
            for (const node of group) {
                if (node) {
                    cb(node, node.datum as GDatum, i, group);
                }
                i++;
            }
        }

        return this;
    }

    remove(): this {
        return this.each((node) => {
            const parent = node.parent;
            if (parent) {
                parent.removeChild(node as unknown as Node);
            }
        });
    }

    merge(other: Selection<G, P, GDatum, PDatum>): Selection<G, P, GDatum, PDatum> {
        const groups0 = this.groups;
        const groups1 = other.groups;
        const m0 = groups0.length;
        const m1 = groups1.length;
        const m = Math.min(m0, m1);
        const merges = new Array<(G | undefined)[]>(m0);

        let j = 0;

        for (; j < m; j++) {
            const group0 = groups0[j];
            const group1 = groups1[j];
            const n = group0.length;
            const merge = (merges[j] = new Array<G | undefined>(n));

            for (let i = 0; i < n; i++) {
                const node = group0[i] || group1[i];

                merge[i] = node || undefined;
            }
        }

        for (; j < m0; j++) {
            merges[j] = groups0[j];
        }

        return new Selection<G, P, GDatum, PDatum>(merges, this.parents);
    }

    private enterGroups?: (EnterNode | undefined)[][];
    private exitGroups?: (G | undefined)[][];

    get enter() {
        return new Selection<EnterNode, P, GDatum, PDatum>(this.enterGroups ? this.enterGroups : [[]], this.parents);
    }

    get exit() {
        return new Selection<G, P, GDatum, PDatum>(this.exitGroups ? this.exitGroups : [[]], this.parents);
    }

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
    setData<GDatum>(values: GDatum[] | ValueFn<P, GDatum, PDatum>): Selection<G, P, GDatum, PDatum> {
        if (typeof values !== 'function') {
            const data = values;
            values = () => data;
        }

        const groups = this.groups;
        const parents = this.parents;
        const numGroups = groups.length;
        const updateGroups: (G | undefined)[][] = new Array(numGroups);
        const enterGroups: (EnterNode | undefined)[][] = new Array(numGroups);
        const exitGroups: (G | undefined)[][] = new Array(numGroups);

        for (let j = 0; j < numGroups; j++) {
            const group = groups[j];
            const parent = parents[j];

            if (!parent) {
                throw new Error(`Group #${j} has no parent: ${group}`);
            }

            const groupSize = group.length;
            const data: GDatum[] = values(parent, parent.datum, j, parents);
            const dataSize = data.length;

            const enterGroup = (enterGroups[j] = new Array<EnterNode | undefined>(dataSize));
            const updateGroup = (updateGroups[j] = new Array<G | undefined>(dataSize));
            const exitGroup = (exitGroups[j] = new Array<G | undefined>(groupSize));

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
                    let next = updateGroup[i1];
                    while (!next && i1 < dataSize) {
                        i1++;
                        next = updateGroup[i1];
                    }
                    previous.next = next || null;
                }
            }
        }

        const result = new Selection<G, P, GDatum, PDatum>(updateGroups, parents);
        result.enterGroups = enterGroups;
        result.exitGroups = exitGroups;

        return result;
    }

    private bindIndex<GDatum>(
        parent: P,
        group: (G | undefined)[],
        enter: (EnterNode | undefined)[],
        update: (G | undefined)[],
        exit: (G | undefined)[],
        data: GDatum[]
    ) {
        const groupSize = group.length;
        const dataSize = data.length;

        let i = 0;

        for (; i < dataSize; i++) {
            const node = group[i];

            if (node) {
                node.datum = data[i];
                update[i] = node;
            } else {
                // more datums than group nodes
                enter[i] = new EnterNode(parent, data[i]);
            }
        }

        // more group nodes than datums
        for (; i < groupSize; i++) {
            const node = group[i];

            if (node) {
                exit[i] = node;
            }
        }
    }
}
