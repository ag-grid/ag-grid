/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generic_1 = require("./utils/generic");
function defaultGroupComparator(valueA, valueB, nodeA, nodeB, accentedCompare) {
    if (accentedCompare === void 0) { accentedCompare = false; }
    console.warn('AG Grid: Since ag-grid 11.0.0 defaultGroupComparator is not necessary. You can remove this from your colDef');
    var nodeAIsGroup = generic_1.exists(nodeA) && nodeA.group;
    var nodeBIsGroup = generic_1.exists(nodeB) && nodeB.group;
    var bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    var bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;
    if (bothAreGroups) {
        return generic_1.defaultComparator(nodeA.key, nodeB.key, accentedCompare);
    }
    if (bothAreNormal) {
        return generic_1.defaultComparator(valueA, valueB, accentedCompare);
    }
    if (nodeAIsGroup) {
        return 1;
    }
    return -1;
}
exports.defaultGroupComparator = defaultGroupComparator;

//# sourceMappingURL=functions.js.map
