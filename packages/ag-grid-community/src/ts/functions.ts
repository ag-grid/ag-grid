import { RowNode } from "./entities/rowNode";
import { _ } from './utils';

export function defaultGroupComparator(valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, accentedCompare: boolean = false): number {
    console.warn('ag-Grid: Since ag-grid 11.0.0 defaultGroupComparator is not necessary. You can remove this from your colDef');
    const nodeAIsGroup = _.exists(nodeA) && nodeA.group;
    const nodeBIsGroup = _.exists(nodeB) && nodeB.group;

    const bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    const bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;

    if (bothAreGroups) {
        return _.defaultComparator(nodeA.key, nodeB.key, accentedCompare);
    } else if (bothAreNormal) {
        return _.defaultComparator(valueA, valueB, accentedCompare);
    } else if (nodeAIsGroup) {
        return 1;
    } else {
        return -1;
    }
}
