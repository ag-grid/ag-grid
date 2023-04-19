interface Tick {
    labels: string[];
}
/**
 * The tree layout is calculated in abstract x/y coordinates, where the root is at (0, 0)
 * and the tree grows downward from the root.
 */
declare class TreeNode {
    label: string;
    x: number;
    y: number;
    subtreeLeft: number;
    subtreeRight: number;
    screenX: number;
    screenY: number;
    parent?: TreeNode;
    children: TreeNode[];
    leafCount: number;
    depth: number;
    prelim: number;
    mod: number;
    thread?: TreeNode;
    ancestor: this;
    change: number;
    shift: number;
    number: number;
    constructor(label?: string, parent?: any, number?: number);
    getLeftSibling(): TreeNode | undefined;
    getLeftmostSibling(): TreeNode | undefined;
    nextLeft(): TreeNode | undefined;
    nextRight(): TreeNode | undefined;
    getSiblings(): TreeNode[];
}
/**
 * Converts an array of ticks, where each tick has an array of labels, to a label tree.
 * If `pad` is `true`, will ensure that every branch matches the depth of the tree by
 * creating empty labels.
 */
export declare function ticksToTree(ticks: Tick[], pad?: boolean): TreeNode;
declare class Dimensions {
    top: number;
    right: number;
    bottom: number;
    left: number;
    update(node: TreeNode, xy: (node: TreeNode) => {
        x: number;
        y: number;
    }): void;
}
export declare function treeLayout(root: TreeNode): TreeLayout;
export declare class TreeLayout {
    dimensions: Dimensions;
    leafCount: number;
    nodes: TreeNode[];
    leafNodes: TreeNode[];
    nonLeafNodes: TreeNode[];
    depth: number;
    update(node: TreeNode): void;
    resize(width: number, height: number, shiftX?: number, shiftY?: number, flipX?: boolean): void;
}
export {};
