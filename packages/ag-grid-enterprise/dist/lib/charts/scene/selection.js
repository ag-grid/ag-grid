// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./node");
var EnterNode = /** @class */ (function () {
    function EnterNode(parent, datum) {
        this.next = null;
        this.scene = parent.scene;
        this.parent = parent;
        this.datum = datum;
    }
    EnterNode.prototype.appendChild = function (node) {
        // This doesn't work without the `strict: true` in the `tsconfig.json`,
        // so we must have two `if` checks below, instead of this single one.
        // if (this.next && !Node.isNode(this.next)) {
        //     throw new Error(`${this.next} is not a Node.`);
        // }
        if (this.next === null) {
            return this.parent.insertBefore(node, null);
        }
        if (!node_1.Node.isNode(this.next)) {
            throw new Error(this.next + " is not a Node.");
        }
        return this.parent.insertBefore(node, this.next);
    };
    EnterNode.prototype.insertBefore = function (node, nextNode) {
        return this.parent.insertBefore(node, nextNode);
    };
    return EnterNode;
}());
exports.EnterNode = EnterNode;
/**
 * G - type of the selected node(s).
 * GDatum - type of the datum of the selected node(s).
 * P - type of the parent node(s).
 * PDatum - type of the datum of the parent node(s).
 */
var Selection = /** @class */ (function () {
    function Selection(groups, parents) {
        this.groups = groups;
        this.parents = parents;
    }
    Selection.select = function (node) {
        return new Selection([[typeof node === 'function' ? node() : node]], [undefined]);
    };
    Selection.selectAll = function (nodes) {
        return new Selection([nodes == null ? [] : nodes], [undefined]);
    };
    /**
     * Creates new nodes, appends them to the nodes of this selection and returns them
     * as a new selection. The created nodes inherit the datums and the parents of the nodes
     * they replace.
     * @param Class The constructor function to use to create the new nodes.
     */
    Selection.prototype.append = function (Class) {
        return this.select(function (node) {
            return node.appendChild(new Class());
        });
    };
    /**
     * Same as the {@link append}, but accepts a custom creator function with the
     * {@link NodeSelector} signature rather than a constructor function.
     * @param creator
     */
    Selection.prototype.appendFn = function (creator) {
        return this.select(function (node, data, index, group) {
            return node.appendChild(creator(node, data, index, group));
        });
    };
    /**
     * Runs the given selector that returns a single node for every node in each group.
     * The original nodes are then replaced by the nodes returned by the selector
     * and returned as a new selection.
     * The selected nodes inherit the datums and the parents of the original nodes.
     */
    Selection.prototype.select = function (selector) {
        var groups = this.groups;
        var numGroups = groups.length;
        var subgroups = [];
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var groupSize = group.length;
            var subgroup = subgroups[j] = new Array(groupSize);
            for (var i = 0; i < groupSize; i++) {
                var node = group[i];
                if (node) {
                    var subnode = selector(node, node.datum, i, group);
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
    };
    /**
     * Same as {@link select}, but uses the given {@param Class} (constructor) as a selector.
     * @param Class The constructor function to use to find matching nodes.
     */
    Selection.prototype.selectByClass = function (Class) {
        return this.select(function (node) {
            if (node_1.Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child instanceof Class) {
                        return child;
                    }
                }
            }
        });
    };
    Selection.prototype.selectByTag = function (tag) {
        return this.select(function (node) {
            if (node_1.Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child.tag === tag) {
                        return child;
                    }
                }
            }
        });
    };
    Selection.prototype.selectAllByClass = function (Class) {
        return this.selectAll(function (node) {
            var nodes = [];
            if (node_1.Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child instanceof Class) {
                        nodes.push(child);
                    }
                }
            }
            return nodes;
        });
    };
    Selection.prototype.selectAllByTag = function (tag) {
        return this.selectAll(function (node) {
            var nodes = [];
            if (node_1.Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child.tag === tag) {
                        nodes.push(child);
                    }
                }
            }
            return nodes;
        });
    };
    Selection.prototype.selectNone = function () {
        return [];
    };
    /**
     * Runs the given selector that returns a group of nodes for every node in each group.
     * The original nodes are then replaced by the groups of nodes returned by the selector
     * and returned as a new selection. The original nodes become the parent nodes for each
     * group in the new selection. The selected nodes do not inherit the datums of the original nodes.
     * If called without any parameters, creates a new selection with an empty group for each
     * node in this selection.
     */
    Selection.prototype.selectAll = function (selectorAll) {
        if (!selectorAll) {
            selectorAll = this.selectNone;
        }
        // Each subgroup is populated with the selector (run on each group node) results.
        var subgroups = [];
        // In the new selection that we return, subgroups become groups,
        // and group nodes become parents.
        var parents = [];
        var groups = this.groups;
        var groupCount = groups.length;
        for (var j = 0; j < groupCount; j++) {
            var group = groups[j];
            var groupLength = group.length;
            for (var i = 0; i < groupLength; i++) {
                var node = group[i];
                if (node) {
                    subgroups.push(selectorAll(node, node.datum, i, group));
                    parents.push(node);
                }
            }
        }
        return new Selection(subgroups, parents);
    };
    /**
     * Runs the given callback for every node in this selection and returns this selection.
     * @param cb
     */
    Selection.prototype.each = function (cb) {
        var groups = this.groups;
        var numGroups = groups.length;
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var groupSize = group.length;
            for (var i = 0; i < groupSize; i++) {
                var node = group[i];
                if (node) {
                    cb(node, node.datum, i, group);
                }
            }
        }
        return this;
    };
    Selection.prototype.remove = function () {
        return this.each(function (node) {
            if (node_1.Node.isNode(node)) {
                var parent_1 = node.parent;
                if (parent_1) {
                    parent_1.removeChild(node);
                }
            }
        });
    };
    Selection.prototype.merge = function (other) {
        var groups0 = this.groups;
        var groups1 = other.groups;
        var m0 = groups0.length;
        var m1 = groups1.length;
        var m = Math.min(m0, m1);
        var merges = new Array(m0);
        var j = 0;
        for (; j < m; j++) {
            var group0 = groups0[j];
            var group1 = groups1[j];
            var n = group0.length;
            var merge = merges[j] = new Array(n);
            for (var i = 0; i < n; i++) {
                var node = group0[i] || group1[i];
                merge[i] = node || undefined;
            }
        }
        for (; j < m0; j++) {
            merges[j] = groups0[j];
        }
        return new Selection(merges, this.parents);
    };
    /**
     * Return the first non-null element in this selection.
     * If the selection is empty, returns null.
     */
    Selection.prototype.node = function () {
        var groups = this.groups;
        var numGroups = groups.length;
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var groupSize = group.length;
            for (var i = 0; i < groupSize; i++) {
                var node = group[i];
                if (node) {
                    return node;
                }
            }
        }
        return null;
    };
    Selection.prototype.attr = function (name, value) {
        this.each(function (node) {
            node[name] = value;
        });
        return this;
    };
    Selection.prototype.attrFn = function (name, value) {
        this.each(function (node, datum, index, group) {
            node[name] = value(node, datum, index, group);
        });
        return this;
    };
    /**
     * Invokes the given function once, passing in this selection.
     * Returns this selection. Facilitates method chaining.
     * @param cb
     */
    Selection.prototype.call = function (cb) {
        cb(this);
        return this;
    };
    Object.defineProperty(Selection.prototype, "size", {
        /**
         * Returns the total number of nodes in this selection.
         */
        get: function () {
            var size = 0;
            this.each(function () { return size++; });
            return size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "data", {
        /**
         * Returns the array of data for the selected elements.
         */
        get: function () {
            var data = [];
            this.each(function (_, datum) { return data.push(datum); });
            return data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "enter", {
        get: function () {
            return new Selection(this.enterGroups ? this.enterGroups : [[]], this.parents);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "exit", {
        get: function () {
            return new Selection(this.exitGroups ? this.exitGroups : [[]], this.parents);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Binds the given value to each selected node and returns this selection
     * with its {@link GDatum} type changed to the type of the given value.
     * This method doesn't compute a join and doesn't affect indexes or the enter and exit selections.
     * This method can also be used to clear bound data.
     * @param value
     */
    Selection.prototype.setDatum = function (value) {
        return this.each(function (node) {
            node.datum = value;
        });
    };
    Object.defineProperty(Selection.prototype, "datum", {
        /**
         * Returns the bound datum for the first non-null element in the selection.
         * This is generally useful only if you know the selection contains exactly one element.
         */
        get: function () {
            var node = this.node();
            return node ? node.datum : null;
        },
        enumerable: true,
        configurable: true
    });
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
    Selection.prototype.setData = function (values, key) {
        if (typeof values !== 'function') {
            var data_1 = values;
            values = function () { return data_1; };
        }
        var groups = this.groups;
        var parents = this.parents;
        var numGroups = groups.length;
        var updateGroups = new Array(numGroups);
        var enterGroups = new Array(numGroups);
        var exitGroups = new Array(numGroups);
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var parent_2 = parents[j];
            if (!parent_2) {
                throw new Error("Group #" + j + " has no parent: " + group);
            }
            var groupSize = group.length;
            var data = values(parent_2, parent_2.datum, j, parents);
            var dataSize = data.length;
            var enterGroup = enterGroups[j] = new Array(dataSize);
            var updateGroup = updateGroups[j] = new Array(dataSize);
            var exitGroup = exitGroups[j] = new Array(groupSize);
            if (key) {
                this.bindKey(parent_2, group, enterGroup, updateGroup, exitGroup, data, key);
            }
            else {
                this.bindIndex(parent_2, group, enterGroup, updateGroup, exitGroup, data);
            }
            // Now connect the enter nodes to their following update node, such that
            // appendChild can insert the materialized enter node before this node,
            // rather than at the end of the parent node.
            for (var i0 = 0, i1 = 0; i0 < dataSize; i0++) {
                var previous = enterGroup[i0];
                if (previous) {
                    if (i0 >= i1) {
                        i1 = i0 + 1;
                    }
                    var next = void 0;
                    while (!(next = updateGroup[i1]) && i1 < dataSize) {
                        i1++;
                    }
                    previous.next = next || null;
                }
            }
        }
        var result = new Selection(updateGroups, parents);
        result.enterGroups = enterGroups;
        result.exitGroups = exitGroups;
        return result;
    };
    Selection.prototype.bindIndex = function (parent, group, enter, update, exit, data) {
        var groupSize = group.length;
        var dataSize = data.length;
        var i = 0;
        for (; i < dataSize; i++) {
            var node = group[i];
            if (node) {
                node.datum = data[i];
                update[i] = node;
            }
            else { // more datums than group nodes
                enter[i] = new EnterNode(parent, data[i]);
            }
        }
        // more group nodes than datums
        for (; i < groupSize; i++) {
            var node = group[i];
            if (node) {
                exit[i] = node;
            }
        }
    };
    Selection.prototype.bindKey = function (parent, group, enter, update, exit, data, key) {
        var groupSize = group.length;
        var dataSize = data.length;
        var keyValues = new Array(groupSize);
        var nodeByKeyValue = {};
        // Compute the key for each node.
        // If multiple nodes have the same key, the duplicates are added to exit.
        for (var i = 0; i < groupSize; i++) {
            var node = group[i];
            if (node) {
                var keyValue = keyValues[i] = Selection.keyPrefix + key(node, node.datum, i, group);
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
        for (var i = 0; i < dataSize; i++) {
            var keyValue = Selection.keyPrefix + key(parent, data[i], i, data);
            var node = nodeByKeyValue[keyValue];
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
        for (var i = 0; i < groupSize; i++) {
            var node = group[i];
            if (node && (nodeByKeyValue[keyValues[i]] === node)) {
                exit[i] = node;
            }
        }
    };
    Selection.keyPrefix = '$'; // Protect against keys like '__proto__'.
    return Selection;
}());
exports.Selection = Selection;
