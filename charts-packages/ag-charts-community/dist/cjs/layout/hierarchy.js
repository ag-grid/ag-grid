"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HierarchyNode = /** @class */ (function () {
    function HierarchyNode(data) {
        this.value = 0;
        this.depth = 0;
        this.height = 0;
        this.parent = undefined;
        this.children = undefined;
        this.data = data;
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
        while (node = nodes.pop()) {
            next.push(node);
            var children = node.children;
            if (children) {
                for (var i = 0, n = children.length; i < n; ++i) {
                    nodes.push(children[i]);
                }
            }
        }
        var index = -1;
        while (node = next.pop()) {
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
        while (node = nodes.pop()) {
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
            var sum = +value(node.data) || 0;
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
        // const otherBranch = [];
        // while (end !== ancestor) {
        //     otherBranch.push(end);
        //     end = end.parent;
        // }
        // nodes.concat(otherBranch.reverse());
        return nodes;
    };
    HierarchyNode.prototype.ancestors = function () {
        var node = this;
        var nodes = [node];
        while (node = node.parent) {
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
            if (node !== root) { // Don’t include the root’s parent, if any.
                links.push({ source: node.parent, target: node });
            }
        });
        return links;
    };
    HierarchyNode.prototype.copy = function () {
        // TODO
    };
    HierarchyNode.prototype.iterator = function (callback) {
        var node = this;
        var next = [node];
        var current;
        doLoop: do {
            current = next.reverse();
            next = [];
            while (node = current.pop()) {
                if (callback(node) === false) {
                    break doLoop;
                }
                var children = node.children;
                if (children) {
                    for (var i = 0, n = children.length; i < n; ++i) {
                        next.push(children[i]);
                    }
                }
            }
        } while (next.length);
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
    var node;
    var child, childs, i, n;
    while (node = nodes.pop()) {
        if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
            node.children = childs;
            for (i = n - 1; i >= 0; --i) {
                nodes.push(child = childs[i] = new HierarchyNode(childs[i]));
                child.parent = node;
                child.depth = node.depth + 1;
            }
        }
    }
    return root.eachBefore(computeHeight);
}
exports.hierarchy = hierarchy;
function computeHeight(node) {
    var height = 0;
    do {
        node.height = height;
    } while ((node = node.parent) && (node.height < ++height));
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
//# sourceMappingURL=hierarchy.js.map