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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var HierarchyNode = /** @class */ (function () {
    function HierarchyNode(datum) {
        this.value = 0;
        this.depth = 0;
        this.height = 0;
        this.parent = undefined;
        this.children = undefined;
        this.datum = datum;
    }
    HierarchyNode.prototype.countFn = function (node) {
        var sum = 0, children = node.children;
        if (!children || !children.length) {
            sum = 1;
        }
        else {
            var i = children.length;
            while (--i >= 0) {
                sum += children[i].value;
            }
        }
        node.value = sum;
    };
    HierarchyNode.prototype.count = function () {
        return this.eachAfter(this.countFn);
    };
    HierarchyNode.prototype.each = function (callback, scope) {
        var _this = this;
        var index = -1;
        this.iterator(function (node) {
            callback.call(scope, node, ++index, _this);
        });
        return this;
    };
    /**
     * Invokes the given callback for each node in post-order traversal.
     * @param callback
     * @param scope
     */
    HierarchyNode.prototype.eachAfter = function (callback, scope) {
        var node = this;
        var nodes = [node];
        var next = [];
        while ((node = nodes.pop())) {
            next.push(node);
            var children = node.children;
            if (children) {
                for (var i = 0, n = children.length; i < n; ++i) {
                    nodes.push(children[i]);
                }
            }
        }
        var index = -1;
        while ((node = next.pop())) {
            callback.call(scope, node, ++index, this);
        }
        return this;
    };
    /**
     * Invokes the given callback for each node in pre-order traversal.
     * @param callback
     * @param scope
     */
    HierarchyNode.prototype.eachBefore = function (callback, scope) {
        var node = this;
        var nodes = [node];
        var index = -1;
        while ((node = nodes.pop())) {
            callback.call(scope, node, ++index, this);
            var children = node.children;
            if (children) {
                for (var i = children.length - 1; i >= 0; --i) {
                    var child = children[i];
                    nodes.push(child);
                }
            }
        }
        return this;
    };
    HierarchyNode.prototype.find = function (callback, scope) {
        var _this = this;
        var index = -1;
        var result;
        this.iterator(function (node) {
            if (callback.call(scope, node, ++index, _this)) {
                result = node;
                return false;
            }
        });
        return result;
    };
    HierarchyNode.prototype.sum = function (value) {
        return this.eachAfter(function (node) {
            var sum = +value(node.datum) || 0;
            var children = node.children;
            if (children) {
                var i = children.length;
                while (--i >= 0) {
                    sum += children[i].value;
                }
            }
            node.value = sum;
        });
    };
    HierarchyNode.prototype.sort = function (compare) {
        return this.eachBefore(function (node) {
            if (node.children) {
                node.children.sort(compare);
            }
        });
    };
    HierarchyNode.prototype.path = function (end) {
        var start = this;
        var ancestor = leastCommonAncestor(start, end);
        var nodes = [start];
        while (start !== ancestor) {
            start = start.parent;
            nodes.push(start);
        }
        var k = nodes.length;
        while (end !== ancestor) {
            nodes.splice(k, 0, end);
            end = end.parent;
        }
        return nodes;
    };
    HierarchyNode.prototype.ancestors = function () {
        var node = this;
        var nodes = [node];
        while ((node = node.parent)) {
            nodes.push(node);
        }
        return nodes;
    };
    HierarchyNode.prototype.descendants = function () {
        var nodes = [];
        this.iterator(function (node) { return nodes.push(node); });
        return nodes;
    };
    HierarchyNode.prototype.leaves = function () {
        var leaves = [];
        this.eachBefore(function (node) {
            if (!node.children) {
                leaves.push(node);
            }
        });
        return leaves;
    };
    HierarchyNode.prototype.links = function () {
        var root = this;
        var links = [];
        root.each(function (node) {
            if (node !== root) {
                // Don’t include the root’s parent, if any.
                links.push({ source: node.parent, target: node });
            }
        });
        return links;
    };
    HierarchyNode.prototype.iterator = function (callback) {
        var e_1, _a;
        var _b = this.children, children = _b === void 0 ? [] : _b;
        if (callback(this) === false) {
            return false;
        }
        try {
            for (var children_1 = __values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                var child = children_1_1.value;
                if (child.iterator(callback) === false) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    return HierarchyNode;
}());
exports.HierarchyNode = HierarchyNode;
function hierarchy(data, children) {
    if (data instanceof Map) {
        data = [undefined, data];
        if (children === undefined) {
            children = mapChildren;
        }
    }
    else if (children === undefined) {
        children = objectChildren;
    }
    var root = new HierarchyNode(data);
    var nodes = [root];
    var _loop_1 = function () {
        var node = nodes.pop();
        var datumChildren = children(node.datum);
        if (!datumChildren) {
            return "continue";
        }
        var newNodes = Array.from(datumChildren).map(function (dc) { return new HierarchyNode(dc); });
        newNodes.forEach(function (child) {
            child.parent = node;
            child.depth = node.depth + 1;
        });
        node.children = newNodes;
        nodes.push.apply(nodes, __spread(newNodes));
    };
    while (nodes.length > 0) {
        _loop_1();
    }
    return root.eachBefore(computeHeight);
}
exports.hierarchy = hierarchy;
function computeHeight(node) {
    var height = 0;
    do {
        node.height = height;
        node = node.parent;
    } while (node && node.height < ++height);
}
function mapChildren(d) {
    return Array.isArray(d) ? d[1] : undefined;
}
function objectChildren(d) {
    return d.children;
}
function leastCommonAncestor(a, b) {
    if (!(a && b)) {
        return undefined;
    }
    if (a === b) {
        return a;
    }
    var aNodes = a.ancestors();
    var bNodes = b.ancestors();
    var c = undefined;
    a = aNodes.pop();
    b = bNodes.pop();
    while (a === b) {
        c = a;
        a = aNodes.pop();
        b = bNodes.pop();
    }
    return c;
}
