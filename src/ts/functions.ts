import {RowNode} from "./entities/rowNode";
import _ from './utils';

export function defaultGroupComparator(valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode): number {
    var bothAreGroups = nodeA.group && nodeB.group;
    var bothAreNormal = !nodeA.group && !nodeB.group;

    if (bothAreGroups) {
        return _.defaultComparator(nodeA.key, nodeB.key);
    } else if (bothAreNormal) {
        return _.defaultComparator(valueA, valueB);
    } else if (nodeA.group) {
        return 1;
    } else {
        return -1;
    }
}
