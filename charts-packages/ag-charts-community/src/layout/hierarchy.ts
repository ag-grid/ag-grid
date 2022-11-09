class HierarchyNode {
    datum: any;
    value: number = 0;
    depth: number = 0;
    height: number = 0;
    parent?: HierarchyNode = undefined;
    children?: HierarchyNode[] = undefined;

    constructor(datum: any) {
        this.datum = datum;
    }

    private countFn(node: HierarchyNode) {
        let sum = 0,
            children = node.children;

        if (!children || !children.length) {
            sum = 1;
        } else {
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

    each(callback: (node: HierarchyNode, index: number, root: this) => void, scope?: any): this {
        let index = -1;
        this.iterator((node) => {
            callback.call(scope, node, ++index, this);
        });
        return this;
    }

    /**
     * Invokes the given callback for each node in post-order traversal.
     * @param callback
     * @param scope
     */
    eachAfter(callback: (node: HierarchyNode, index: number, root: this) => void, scope?: any): this {
        let node: HierarchyNode | undefined = this;
        const nodes: HierarchyNode[] = [node];
        const next = [];

        while ((node = nodes.pop())) {
            next.push(node);
            const { children } = node;
            if (children) {
                for (let i = 0, n = children.length; i < n; ++i) {
                    nodes.push(children[i]);
                }
            }
        }

        let index = -1;
        while ((node = next.pop())) {
            callback.call(scope, node, ++index, this);
        }

        return this;
    }

    /**
     * Invokes the given callback for each node in pre-order traversal.
     * @param callback
     * @param scope
     */
    eachBefore(callback: (node: HierarchyNode, index: number, root: this) => void, scope?: any): this {
        let node: HierarchyNode | undefined = this;
        const nodes: HierarchyNode[] = [node];
        let index = -1;

        while ((node = nodes.pop())) {
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

    find(
        callback: (node: HierarchyNode, index: number, root: this) => boolean,
        scope?: any
    ): HierarchyNode | undefined {
        let index = -1;
        let result: HierarchyNode | undefined;

        this.iterator((node) => {
            if (callback.call(scope, node, ++index, this)) {
                result = node;
                return false;
            }
        });
        return result;
    }

    sum(value: (datum: any) => number): this {
        return this.eachAfter((node) => {
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

    sort(compare?: (a: HierarchyNode, b: HierarchyNode) => number): this {
        return this.eachBefore(function (node) {
            if (node.children) {
                node.children.sort(compare);
            }
        });
    }

    path(end: any): HierarchyNode[] {
        let start: HierarchyNode = this;
        const ancestor = leastCommonAncestor(start, end);
        const nodes = [start];

        while (start !== ancestor) {
            start = start.parent!;
            nodes.push(start);
        }
        const k = nodes.length;
        while (end !== ancestor) {
            nodes.splice(k, 0, end);
            end = end.parent;
        }
        return nodes;
    }

    ancestors(): HierarchyNode[] {
        let node: HierarchyNode | undefined = this;
        const nodes: HierarchyNode[] = [node];
        while ((node = node.parent)) {
            nodes.push(node);
        }
        return nodes;
    }

    descendants(): HierarchyNode[] {
        const nodes: HierarchyNode[] = [];
        this.iterator((node) => nodes.push(node));
        return nodes;
    }

    leaves(): HierarchyNode[] {
        const leaves: HierarchyNode[] = [];
        this.eachBefore((node) => {
            if (!node.children) {
                leaves.push(node);
            }
        });
        return leaves;
    }

    links() {
        let root = this;
        const links: { source: HierarchyNode | undefined; target: HierarchyNode }[] = [];
        root.each((node) => {
            if (node !== root) {
                // Don’t include the root’s parent, if any.
                links.push({ source: node.parent, target: node });
            }
        });
        return links;
    }

    iterator(callback: (node: HierarchyNode) => any) {
        const { children = [] } = this;

        if (callback(this) === false) {
            return false;
        }

        for (const child of children) {
            if (child.iterator(callback) === false) {
                return false;
            }
        }

        return true;
    }
}

export function hierarchy(data: any[], children?: (d: any) => any[]) {
    if (data instanceof Map) {
        data = [undefined, data];
        if (children === undefined) {
            children = mapChildren;
        }
    } else if (children === undefined) {
        children = objectChildren;
    }

    const root = new HierarchyNode(data);
    const nodes = [root];

    while (nodes.length > 0) {
        const node = nodes.pop()!;
        const datumChildren = children(node.datum);
        if (!datumChildren) {
            continue;
        }

        const newNodes = Array.from(datumChildren).map((dc) => new HierarchyNode(dc));
        newNodes.forEach((child) => {
            child.parent = node;
            child.depth = node.depth + 1;
        });
        node.children = newNodes;
        nodes.push(...newNodes);
    }

    return root.eachBefore(computeHeight);
}

function computeHeight(node: HierarchyNode) {
    let height = 0;
    do {
        node.height = height;
        node = node.parent!;
    } while (node && node.height < ++height);
}

function mapChildren(d: any[]): any[] {
    return Array.isArray(d) ? d[1] : undefined;
}

function objectChildren(d: any): any[] {
    return d.children;
}

function leastCommonAncestor(a: HierarchyNode | undefined, b: HierarchyNode | undefined): HierarchyNode | undefined {
    if (!(a && b)) {
        return undefined;
    }

    if (a === b) {
        return a;
    }

    const aNodes = a.ancestors();
    const bNodes = b.ancestors();
    let c: HierarchyNode | undefined = undefined;

    a = aNodes.pop();
    b = bNodes.pop();

    while (a === b) {
        c = a;
        a = aNodes.pop();
        b = bNodes.pop();
    }

    return c;
}
