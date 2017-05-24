import {RowNode} from "./entities/rowNode";
import {Utils as _} from './utils';

export function defaultGroupComparator(valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode): number {

    let nodeAIsGroup = _.exists(nodeA) && nodeA.group;
    let nodeBIsGroup = _.exists(nodeB) && nodeB.group;

    let bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    let bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;

    if (bothAreGroups) {
        return _.defaultComparator(nodeA.key, nodeB.key);
    } else if (bothAreNormal) {
        return _.defaultComparator(valueA, valueB);
    } else if (nodeAIsGroup) {
        return 1;
    } else {
        return -1;
    }
}
