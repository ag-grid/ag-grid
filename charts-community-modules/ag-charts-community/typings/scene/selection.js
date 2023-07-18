"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selection = void 0;
var node_1 = require("./node");
var Selection = /** @class */ (function () {
    function Selection(parent, classOrFactory, garbageCollection) {
        if (garbageCollection === void 0) { garbageCollection = true; }
        this._nodes = [];
        this._data = [];
        this._datumNodeIndices = new Map();
        // If garbage collection is set to false, you must call `selection.cleanup()` to remove deleted nodes
        this._garbage = [];
        this._garbageCollection = true;
        this._parent = parent;
        this._factory = Object.prototype.isPrototypeOf.call(node_1.Node, classOrFactory)
            ? function () { return new classOrFactory(); }
            : classOrFactory;
        this._garbageCollection = garbageCollection;
    }
    Selection.select = function (parent, classOrFactory, garbageCollection) {
        if (garbageCollection === void 0) { garbageCollection = true; }
        return new Selection(parent, classOrFactory, garbageCollection);
    };
    Selection.prototype.each = function (iterate) {
        this._nodes.forEach(function (node, i) { return iterate(node, node.datum, i); });
        return this;
    };
    /**
     * Update the data in a selection. If an `getDatumId()` function is provided, maintain a list of ids related to
     * the nodes. Otherwise, take the more efficient route of simply creating and destroying nodes at the end
     * of the array.
     */
    Selection.prototype.update = function (data, init, getDatumId) {
        var e_1, _a;
        var _this = this;
        var old = this._data;
        var parent = this._parent;
        var factory = this._factory;
        var datumIds = new Map();
        if (getDatumId) {
            // Check if new datum and append node and save map of datum id to node index
            data.forEach(function (datum, index) {
                var datumId = getDatumId(datum);
                datumIds.set(datumId, index);
                if (!_this._datumNodeIndices.has(datumId)) {
                    var node = factory(datum);
                    node.datum = datum;
                    init === null || init === void 0 ? void 0 : init(node);
                    parent.appendChild(node);
                    _this._nodes.push(node);
                    _this._datumNodeIndices.set(datumId, _this._nodes.length - 1);
                }
            });
        }
        else if (data.length > old.length) {
            // Create and append nodes for new data
            data.slice(old.length).forEach(function (datum) {
                var node = factory(datum);
                node.datum = datum;
                init === null || init === void 0 ? void 0 : init(node);
                parent.appendChild(node);
                _this._nodes.push(node);
            });
        }
        else if (data.length < old.length) {
            // Destroy any nodes that are in excess of the new data
            this._nodes.splice(data.length).forEach(function (node) {
                parent.removeChild(node);
            });
        }
        // Copy the data into a new array to prevent mutation and duplicates
        this._data = data.slice(0);
        if (getDatumId) {
            try {
                // Find and update the datum for each node or throw into garbage if datum no longer exists
                for (var _b = __values(this._datumNodeIndices), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), datumId = _d[0], nodeIndex = _d[1];
                    var datumIndex = datumIds.get(datumId);
                    if (datumIndex !== undefined) {
                        this._nodes[nodeIndex].datum = data[datumIndex];
                    }
                    else {
                        this._garbage.push(datumId);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (this._garbageCollection) {
                this.cleanup();
            }
        }
        else {
            // Reset the node data by index
            for (var i = 0; i < data.length; i++) {
                this._nodes[i].datum = this._data[i];
            }
        }
        return this;
    };
    Selection.prototype.clear = function () {
        this.update([]);
        return this;
    };
    Selection.prototype.cleanup = function () {
        var e_2, _a;
        var _this = this;
        if (this._garbage.length === 0)
            return;
        this._garbage.forEach(function (datumId) {
            var nodeIndex = _this._datumNodeIndices.get(datumId);
            if (nodeIndex === undefined)
                return;
            var node = _this._nodes[nodeIndex];
            delete _this._nodes[nodeIndex];
            _this._datumNodeIndices.delete(datumId);
            if (node) {
                _this._parent.removeChild(node);
            }
        });
        // Reset map of datum ids to node indices while filtering out any removed, undefined, nodes
        var newIndex = 0;
        var datumNodeIndices = this._datumNodeIndices.entries();
        var nodeIndexDatums = new Map();
        try {
            for (var datumNodeIndices_1 = __values(datumNodeIndices), datumNodeIndices_1_1 = datumNodeIndices_1.next(); !datumNodeIndices_1_1.done; datumNodeIndices_1_1 = datumNodeIndices_1.next()) {
                var _b = __read(datumNodeIndices_1_1.value, 2), datumId = _b[0], nodeIndex = _b[1];
                nodeIndexDatums.set(nodeIndex, datumId);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (datumNodeIndices_1_1 && !datumNodeIndices_1_1.done && (_a = datumNodeIndices_1.return)) _a.call(datumNodeIndices_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this._nodes = this._nodes.filter(function (node, index) {
            if (node === undefined)
                return false;
            var datumId = nodeIndexDatums.get(index);
            _this._datumNodeIndices.set(datumId, newIndex);
            newIndex++;
            return true;
        });
        this._garbage = [];
    };
    Selection.selectAll = function (parent, predicate) {
        var results = [];
        var traverse = function (node) {
            if (predicate(node)) {
                results.push(node);
            }
            node.children.forEach(traverse);
        };
        traverse(parent);
        return results;
    };
    Selection.selectByClass = function (node, Class) {
        return Selection.selectAll(node, function (node) { return node instanceof Class; });
    };
    Selection.selectByTag = function (node, tag) {
        return Selection.selectAll(node, function (node) { return node.tag === tag; });
    };
    Selection.prototype.select = function (predicate) {
        return Selection.selectAll(this._parent, predicate);
    };
    Selection.prototype.selectByClass = function (Class) {
        return this.select(function (node) { return node instanceof Class; });
    };
    Selection.prototype.selectByTag = function (tag) {
        return this.select(function (node) { return node.tag === tag; });
    };
    Selection.prototype.nodes = function () {
        return this._nodes;
    };
    return Selection;
}());
exports.Selection = Selection;
//# sourceMappingURL=selection.js.map