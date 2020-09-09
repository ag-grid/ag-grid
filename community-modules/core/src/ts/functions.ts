import { RowNode } from "./entities/rowNode";
import { exists, defaultComparator } from "./utils/generic";

export function defaultGroupComparator(valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, accentedCompare: boolean = false): number {
    console.warn('ag-Grid: Since ag-grid 11.0.0 defaultGroupComparator is not necessary. You can remove this from your colDef');
    const nodeAIsGroup = exists(nodeA) && nodeA.group;
    const nodeBIsGroup = exists(nodeB) && nodeB.group;

    const bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    const bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;

    if (bothAreGroups) {
        return defaultComparator(nodeA.key, nodeB.key, accentedCompare);
    }

    if (bothAreNormal) {
        return defaultComparator(valueA, valueB, accentedCompare);
    }

    if (nodeAIsGroup) {
        return 1;
    }

    return -1;
}
