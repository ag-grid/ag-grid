/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { _ } from './utils';
export function defaultGroupComparator(valueA, valueB, nodeA, nodeB, accentedCompare) {
    if (accentedCompare === void 0) { accentedCompare = false; }
    console.warn('ag-Grid: Since ag-grid 11.0.0 defaultGroupComparator is not necessary. You can remove this from your colDef');
    var nodeAIsGroup = _.exists(nodeA) && nodeA.group;
    var nodeBIsGroup = _.exists(nodeB) && nodeB.group;
    var bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    var bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;
    if (bothAreGroups) {
        return _.defaultComparator(nodeA.key, nodeB.key, accentedCompare);
    }
    if (bothAreNormal) {
        return _.defaultComparator(valueA, valueB, accentedCompare);
    }
    if (nodeAIsGroup) {
        return 1;
    }
    return -1;
}
