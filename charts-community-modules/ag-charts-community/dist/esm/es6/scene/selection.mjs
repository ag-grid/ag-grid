import { Node } from './node.mjs';
export class Selection {
    constructor(parent, classOrFactory, garbageCollection = true) {
        this._nodes = [];
        this._data = [];
        this._datumNodeIndices = new Map();
        // If garbage collection is set to false, you must call `selection.cleanup()` to remove deleted nodes
        this._garbage = [];
        this._garbageCollection = true;
        this._parent = parent;
        this._factory = Object.prototype.isPrototypeOf.call(Node, classOrFactory)
            ? () => new classOrFactory()
            : classOrFactory;
        this._garbageCollection = garbageCollection;
    }
    static select(parent, classOrFactory, garbageCollection = true) {
        return new Selection(parent, classOrFactory, garbageCollection);
    }
    each(iterate) {
        this._nodes.forEach((node, i) => iterate(node, node.datum, i));
        return this;
    }
    /**
     * Update the data in a selection. If an `getDatumId()` function is provided, maintain a list of ids related to
     * the nodes. Otherwise, take the more efficient route of simply creating and destroying nodes at the end
     * of the array.
     */
    update(data, init, getDatumId) {
        const old = this._data;
        const parent = this._parent;
        const factory = this._factory;
        const datumIds = new Map();
        if (getDatumId) {
            // Check if new datum and append node and save map of datum id to node index
            data.forEach((datum, index) => {
                const datumId = getDatumId(datum);
                datumIds.set(datumId, index);
                if (!this._datumNodeIndices.has(datumId)) {
                    const node = factory(datum);
                    node.datum = datum;
                    init === null || init === void 0 ? void 0 : init(node);
                    parent.appendChild(node);
                    this._nodes.push(node);
                    this._datumNodeIndices.set(datumId, this._nodes.length - 1);
                }
            });
        }
        else if (data.length > old.length) {
            // Create and append nodes for new data
            data.slice(old.length).forEach((datum) => {
                const node = factory(datum);
                node.datum = datum;
                init === null || init === void 0 ? void 0 : init(node);
                parent.appendChild(node);
                this._nodes.push(node);
            });
        }
        else if (data.length < old.length) {
            // Destroy any nodes that are in excess of the new data
            this._nodes.splice(data.length).forEach((node) => {
                parent.removeChild(node);
            });
        }
        // Copy the data into a new array to prevent mutation and duplicates
        this._data = data.slice(0);
        if (getDatumId) {
            // Find and update the datum for each node or throw into garbage if datum no longer exists
            for (const [datumId, nodeIndex] of this._datumNodeIndices) {
                const datumIndex = datumIds.get(datumId);
                if (datumIndex !== undefined) {
                    this._nodes[nodeIndex].datum = data[datumIndex];
                }
                else {
                    this._garbage.push(datumId);
                }
            }
            if (this._garbageCollection) {
                this.cleanup();
            }
        }
        else {
            // Reset the node data by index
            for (let i = 0; i < data.length; i++) {
                this._nodes[i].datum = this._data[i];
            }
        }
        return this;
    }
    clear() {
        this.update([]);
        return this;
    }
    cleanup() {
        if (this._garbage.length === 0)
            return;
        this._garbage.forEach((datumId) => {
            const nodeIndex = this._datumNodeIndices.get(datumId);
            if (nodeIndex === undefined)
                return;
            const node = this._nodes[nodeIndex];
            delete this._nodes[nodeIndex];
            this._datumNodeIndices.delete(datumId);
            if (node) {
                this._parent.removeChild(node);
            }
        });
        // Reset map of datum ids to node indices while filtering out any removed, undefined, nodes
        let newIndex = 0;
        const datumNodeIndices = this._datumNodeIndices.entries();
        const nodeIndexDatums = new Map();
        for (const [datumId, nodeIndex] of datumNodeIndices) {
            nodeIndexDatums.set(nodeIndex, datumId);
        }
        this._nodes = this._nodes.filter((node, index) => {
            if (node === undefined)
                return false;
            const datumId = nodeIndexDatums.get(index);
            this._datumNodeIndices.set(datumId, newIndex);
            newIndex++;
            return true;
        });
        this._garbage = [];
    }
    static selectAll(parent, predicate) {
        const results = [];
        const traverse = (node) => {
            if (predicate(node)) {
                results.push(node);
            }
            node.children.forEach(traverse);
        };
        traverse(parent);
        return results;
    }
    static selectByClass(node, Class) {
        return Selection.selectAll(node, (node) => node instanceof Class);
    }
    static selectByTag(node, tag) {
        return Selection.selectAll(node, (node) => node.tag === tag);
    }
    select(predicate) {
        return Selection.selectAll(this._parent, predicate);
    }
    selectByClass(Class) {
        return this.select((node) => node instanceof Class);
    }
    selectByTag(tag) {
        return this.select((node) => node.tag === tag);
    }
    nodes() {
        return this._nodes;
    }
}
