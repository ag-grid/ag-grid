"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HierarchyNode {
    constructor(datum) {
        this.value = 0;
        this.depth = 0;
        this.height = 0;
        this.parent = undefined;
        this.children = undefined;
        this.datum = datum;
    }
    countFn(node) {
        var sum = 0, children = node.children;
        if (!children || !children.length) {
            sum = 1;
        }
        else {
            let i = children.length;
            while (--i >= 0) {
                sum += children[i].value;
            }
        }
        node.value = sum;
    }
    count() {
        return this.eachAfter(this.countFn);
    }
    each(callback, scope) {
        let index = -1;
        this.iterator(node => {
            callback.call(scope, node, ++index, this);
        });
        return this;
    }
    /**
     * Invokes the given callback for each node in post-order traversal.
     * @param callback
     * @param scope
     */
    eachAfter(callback, scope) {
        let node = this;
        const nodes = [node];
        const next = [];
        while (node = nodes.pop()) {
            next.push(node);
            const { children } = node;
            if (children) {
                for (let i = 0, n = children.length; i < n; ++i) {
                    nodes.push(children[i]);
                }
            }
        }
        let index = -1;
        while (node = next.pop()) {
            callback.call(scope, node, ++index, this);
        }
        return this;
    }
    /**
     * Invokes the given callback for each node in pre-order traversal.
     * @param callback
     * @param scope
     */
    eachBefore(callback, scope) {
        let node = this;
        const nodes = [node];
        let index = -1;
        while (node = nodes.pop()) {
            callback.call(scope, node, ++index, this);
            const { children } = node;
            if (children) {
                for (let i = children.length - 1; i >= 0; --i) {
                    const child = children[i];
                    nodes.push(child);
                }
            }
        }
        return this;
    }
    find(callback, scope) {
        let index = -1;
        let result;
        this.iterator(node => {
            if (callback.call(scope, node, ++index, this)) {
                result = node;
                return false;
            }
        });
        return result;
    }
    sum(value) {
        return this.eachAfter(node => {
            let sum = +value(node.datum) || 0;
            const { children } = node;
            if (children) {
                let i = children.length;
                while (--i >= 0) {
                    sum += children[i].value;
                }
            }
            node.value = sum;
        });
    }
    sort(compare) {
        return this.eachBefore(function (node) {
            if (node.children) {
                node.children.sort(compare);
            }
        });
    }
    path(end) {
        let start = this;
        const ancestor = leastCommonAncestor(start, end);
        const nodes = [start];
        while (start !== ancestor) {
            start = start.parent;
            nodes.push(start);
        }
        const k = nodes.length;
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
    }
    ancestors() {
        let node = this;
        const nodes = [node];
        while (node = node.parent) {
            nodes.push(node);
        }
        return nodes;
    }
    descendants() {
        const nodes = [];
        this.iterator(node => nodes.push(node));
        return nodes;
    }
    leaves() {
        const leaves = [];
        this.eachBefore(node => {
            if (!node.children) {
                leaves.push(node);
            }
        });
        return leaves;
    }
    links() {
        let root = this;
        const links = [];
        root.each(node => {
            if (node !== root) { // Don’t include the root’s parent, if any.
                links.push({ source: node.parent, target: node });
            }
        });
        return links;
    }
    copy() {
        // TODO
    }
    iterator(callback) {
        let node = this;
        let next = [node];
        let current;
        doLoop: do {
            current = next.reverse();
            next = [];
            while (node = current.pop()) {
                if (callback(node) === false) {
                    break doLoop;
                }
                const { children } = node;
                if (children) {
                    for (let i = 0, n = children.length; i < n; ++i) {
                        next.push(children[i]);
                    }
                }
            }
        } while (next.length);
    }
}
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
    const root = new HierarchyNode(data);
    const nodes = [root];
    let node;
    let child, childs, i, n;
    while (node = nodes.pop()) {
        if ((childs = children(node.datum)) && (n = (childs = Array.from(childs)).length)) {
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
    let height = 0;
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
    const aNodes = a.ancestors();
    const bNodes = b.ancestors();
    let c = undefined;
    a = aNodes.pop();
    b = bNodes.pop();
    while (a === b) {
        c = a;
        a = aNodes.pop();
        b = bNodes.pop();
    }
    return c;
}
