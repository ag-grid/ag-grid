// ag-grid-enterprise v21.2.2
interface Tick {
    labels: string[];
}
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
    resize(width: number, height: number, shiftX?: number, shiftY?: number): void;
}
export {};
