/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { exists, defaultComparator } from "./utils/generic";
export function defaultGroupComparator(valueA, valueB, nodeA, nodeB, accentedCompare) {
    if (accentedCompare === void 0) { accentedCompare = false; }
    console.warn('AG Grid: Since ag-grid 11.0.0 defaultGroupComparator is not necessary. You can remove this from your colDef');
    var nodeAIsGroup = exists(nodeA) && nodeA.group;
    var nodeBIsGroup = exists(nodeB) && nodeB.group;
    var bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    var bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;
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
