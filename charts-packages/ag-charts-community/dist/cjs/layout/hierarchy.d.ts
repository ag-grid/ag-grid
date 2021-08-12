export declare class HierarchyNode {
    data: any;
    value: number;
    depth: number;
    height: number;
    parent?: HierarchyNode;
    children?: HierarchyNode[];
    constructor(data: any);
    private countFn;
    count(): this;
    each(callback: (node: HierarchyNode, index: number, root: this) => void, scope?: any): this;
    /**
     * Invokes the given callback for each node in post-order traversal.
     * @param callback
     * @param scope
     */
    eachAfter(callback: (node: HierarchyNode, index: number, root: this) => void, scope?: any): this;
    /**
     * Invokes the given callback for each node in pre-order traversal.
     * @param callback
     * @param scope
     */
    eachBefore(callback: (node: HierarchyNode, index: number, root: this) => void, scope?: any): this;
    find(callback: (node: HierarchyNode, index: number, root: this) => void, scope?: any): HierarchyNode | undefined;
    sum(value: (data: any) => number): this;
    sort(compare?: (a: HierarchyNode, b: HierarchyNode) => number): this;
    path(end: any): HierarchyNode[];
    ancestors(): HierarchyNode[];
    descendants(): HierarchyNode[];
    leaves(): HierarchyNode[];
    links(): {
        source: HierarchyNode | undefined;
        target: HierarchyNode;
    }[];
    copy(): void;
    iterator(callback: (node: HierarchyNode) => any): void;
}
export declare function hierarchy(data: any[], children?: (d: any) => any[]): HierarchyNode;
