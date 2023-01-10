import { Node } from './node';
class EnterNode {
    constructor(parent, datum) {
        this.next = null;
        this.scene = parent.scene;
        this.parent = parent;
        this.datum = datum;
    }
    appendChild(node) {
        // This doesn't work without the `strict: true` in the `tsconfig.json`,
        // so we must have two `if` checks below, instead of this single one.
        // if (this.next && !Node.isNode(this.next)) {
        //     throw new Error(`${this.next} is not a Node.`);
        // }
        if (this.next === null) {
            return this.parent.insertBefore(node, null);
        }
        if (!Node.isNode(this.next)) {
            throw new Error(`${this.next} is not a Node.`);
        }
        return this.parent.insertBefore(node, this.next);
    }
    insertBefore(node, nextNode) {
        return this.parent.insertBefore(node, nextNode);
    }
}
/**
 * G - type of the selected node(s).
 * GDatum - type of the datum of the selected node(s).
 * P - type of the parent node(s).
 * PDatum - type of the datum of the parent node(s).
 */
export class Selection {
    constructor(groups, parents) {
        this.groups = groups;
        this.parents = parents;
    }
    static select(node) {
        return new Selection([[typeof node === 'function' ? node() : node]], [undefined]);
    }
    static selectAll(nodes) {
        return new Selection([nodes == null ? [] : nodes], [undefined]);
    }
    /**
     * Creates new nodes, appends them to the nodes of this selection and returns them
     * as a new selection. The created nodes inherit the datums and the parents of the nodes
     * they replace.
     * @param Class The constructor function to use to create the new nodes.
     */
    append(Class) {
        return this.select((node) => {
            return node.appendChild(new Class());
        });
    }
    /**
     * Runs the given selector that returns a single node for every node in each group.
     * The original nodes are then replaced by the nodes returned by the selector
     * and returned as a new selection.
     * The selected nodes inherit the datums and the parents of the original nodes.
     */
    select(selector) {
        const groups = this.groups;
        const numGroups = groups.length;
        const subgroups = [];
        for (let j = 0; j < numGroups; j++) {
            const group = groups[j];
            const groupSize = group.length;
            const subgroup = (subgroups[j] = new Array(groupSize));
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
    selectByClass(Class) {
        return this.select((node) => {
            if (Node.isNode(node)) {
                const children = node.children;
                const n = children.length;
                for (let i = 0; i < n; i++) {
                    const child = children[i];
                    if (child instanceof Class) {
                        return child;
                    }
                }
            }
        });
    }
    selectByTag(tag) {
        return this.select((node) => {
            if (Node.isNode(node)) {
                const children = node.children;
                const n = children.length;
                for (let i = 0; i < n; i++) {
                    const child = children[i];
                    if (child.tag === tag) {
                        return child;
                    }
                }
            }
        });
    }
    selectAllByClass(Class) {
        return this.selectAll((node) => {
            const nodes = [];
            if (Node.isNode(node)) {
                const children = node.children;
                const n = children.length;
                for (let i = 0; i < n; i++) {
                    const child = children[i];
                    if (child instanceof Class) {
                        nodes.push(child);
                    }
                }
            }
            return nodes;
        });
    }
    selectAllByTag(tag) {
        return this.selectAll((node) => {
            const nodes = [];
            if (Node.isNode(node)) {
                const children = node.children;
                const n = children.length;
                for (let i = 0; i < n; i++) {
                    const child = children[i];
                    if (child.tag === tag) {
                        nodes.push(child);
                    }
                }
            }
            return nodes;
        });
    }
    selectNone() {
        return [];
    }
    /**
     * Runs the given selector that returns a group of nodes for every node in each group.
     * The original nodes are then replaced by the groups of nodes returned by the selector
     * and returned as a new selection. The original nodes become the parent nodes for each
     * group in the new selection. The selected nodes do not inherit the datums of the original nodes.
     * If called without any parameters, creates a new selection with an empty group for each
     * node in this selection.
     */
    selectAll(selectorAll) {
        if (!selectorAll) {
            selectorAll = this.selectNone;
        }
        // Each subgroup is populated with the selector (run on each group node) results.
        const subgroups = [];
        // In the new selection that we return, subgroups become groups,
        // and group nodes become parents.
        const parents = [];
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
        return new Selection(subgroups, parents);
    }
    /**
     * Runs the given callback for every node in this selection and returns this selection.
     * @param cb
     */
    each(cb) {
        for (const group of this.groups) {
            let i = 0;
            for (const node of group) {
                if (node) {
                    cb(node, node.datum, i, group);
                }
                i++;
            }
        }
        return this;
    }
    remove() {
        return this.each((node) => {
            if (Node.isNode(node)) {
                const parent = node.parent;
                if (parent) {
                    parent.removeChild(node);
                }
            }
        });
    }
    merge(other) {
        const groups0 = this.groups;
        const groups1 = other.groups;
        const m0 = groups0.length;
        const m1 = groups1.length;
        const m = Math.min(m0, m1);
        const merges = new Array(m0);
        let j = 0;
        for (; j < m; j++) {
            const group0 = groups0[j];
            const group1 = groups1[j];
            const n = group0.length;
            const merge = (merges[j] = new Array(n));
            for (let i = 0; i < n; i++) {
                const node = group0[i] || group1[i];
                merge[i] = node || undefined;
            }
        }
        for (; j < m0; j++) {
            merges[j] = groups0[j];
        }
        return new Selection(merges, this.parents);
    }
    /**
     * Return the first non-null element in this selection.
     * If the selection is empty, returns null.
     */
    node() {
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
    attr(name, value) {
        this.each((node) => {
            node[name] = value;
        });
        return this;
    }
    attrFn(name, value) {
        this.each((node, datum, index, group) => {
            node[name] = value(node, datum, index, group);
        });
        return this;
    }
    /**
     * Invokes the given function once, passing in this selection.
     * Returns this selection. Facilitates method chaining.
     * @param cb
     */
    call(cb) {
        cb(this);
        return this;
    }
    /**
     * Returns the total number of nodes in this selection.
     */
    get size() {
        let size = 0;
        for (const group of this.groups) {
            for (const node of group) {
                if (node) {
                    size++;
                }
            }
        }
        return size;
    }
    /**
     * Returns the array of data for the selected elements.
     */
    get data() {
        const data = new Array(this.size);
        let i = 0;
        for (const group of this.groups) {
            for (const node of group) {
                if (node) {
                    data[i++] = node.datum;
                }
            }
        }
        return data;
    }
    get enter() {
        return new Selection(this.enterGroups ? this.enterGroups : [[]], this.parents);
    }
    get exit() {
        return new Selection(this.exitGroups ? this.exitGroups : [[]], this.parents);
    }
    /**
     * Binds the given value to each selected node and returns this selection
     * with its {@link GDatum} type changed to the type of the given value.
     * This method doesn't compute a join and doesn't affect indexes or the enter and exit selections.
     * This method can also be used to clear bound data.
     * @param value
     */
    setDatum(value) {
        return this.each((node) => {
            node.datum = value;
        });
    }
    /**
     * Returns the bound datum for the first non-null element in the selection.
     * This is generally useful only if you know the selection contains exactly one element.
     */
    get datum() {
        const node = this.node();
        return node ? node.datum : null;
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
    setData(values, key) {
        if (typeof values !== 'function') {
            const data = values;
            values = () => data;
        }
        const groups = this.groups;
        const parents = this.parents;
        const numGroups = groups.length;
        const updateGroups = new Array(numGroups);
        const enterGroups = new Array(numGroups);
        const exitGroups = new Array(numGroups);
        for (let j = 0; j < numGroups; j++) {
            const group = groups[j];
            const parent = parents[j];
            if (!parent) {
                throw new Error(`Group #${j} has no parent: ${group}`);
            }
            const groupSize = group.length;
            const data = values(parent, parent.datum, j, parents);
            const dataSize = data.length;
            const enterGroup = (enterGroups[j] = new Array(dataSize));
            const updateGroup = (updateGroups[j] = new Array(dataSize));
            const exitGroup = (exitGroups[j] = new Array(groupSize));
            if (key) {
                this.bindKey(parent, group, enterGroup, updateGroup, exitGroup, data, key);
            }
            else {
                this.bindIndex(parent, group, enterGroup, updateGroup, exitGroup, data);
            }
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
        const result = new Selection(updateGroups, parents);
        result.enterGroups = enterGroups;
        result.exitGroups = exitGroups;
        return result;
    }
    bindIndex(parent, group, enter, update, exit, data) {
        const groupSize = group.length;
        const dataSize = data.length;
        let i = 0;
        for (; i < dataSize; i++) {
            const node = group[i];
            if (node) {
                node.datum = data[i];
                update[i] = node;
            }
            else {
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
    bindKey(parent, group, enter, update, exit, data, key) {
        const groupSize = group.length;
        const dataSize = data.length;
        const keyValues = new Array(groupSize);
        const nodeByKeyValue = {};
        // Compute the key for each node.
        // If multiple nodes have the same key, the duplicates are added to exit.
        for (let i = 0; i < groupSize; i++) {
            const node = group[i];
            if (node) {
                const keyValue = (keyValues[i] = Selection.keyPrefix + key(node, node.datum, i, group));
                if (keyValue in nodeByKeyValue) {
                    exit[i] = node;
                }
                else {
                    nodeByKeyValue[keyValue] = node;
                }
            }
        }
        // Compute the key for each datum.
        // If there is a node associated with this key, join and add it to update.
        // If there is not (or the key is a duplicate), add it to enter.
        for (let i = 0; i < dataSize; i++) {
            const keyValue = Selection.keyPrefix + key(parent, data[i], i, data);
            const node = nodeByKeyValue[keyValue];
            if (node) {
                update[i] = node;
                node.datum = data[i];
                nodeByKeyValue[keyValue] = undefined;
            }
            else {
                enter[i] = new EnterNode(parent, data[i]);
            }
        }
        // Add any remaining nodes that were not bound to data to exit.
        for (let i = 0; i < groupSize; i++) {
            const node = group[i];
            if (node && nodeByKeyValue[keyValues[i]] === node) {
                exit[i] = node;
            }
        }
    }
}
Selection.keyPrefix = '$'; // Protect against keys like '__proto__'.
