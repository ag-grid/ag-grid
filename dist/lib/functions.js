/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function defaultGroupComparator(valueA, valueB, nodeA, nodeB, accentedCompare) {
    if (accentedCompare === void 0) { accentedCompare = false; }
    console.warn('ag-Grid: Since ag-grid 11.0.0 defaultGroupComparator is not necessary. You can remove this from your colDef');
    var nodeAIsGroup = utils_1._.exists(nodeA) && nodeA.group;
    var nodeBIsGroup = utils_1._.exists(nodeB) && nodeB.group;
    var bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    var bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;
    if (bothAreGroups) {
        return utils_1._.defaultComparator(nodeA.key, nodeB.key, accentedCompare);
    }
    else if (bothAreNormal) {
        return utils_1._.defaultComparator(valueA, valueB, accentedCompare);
    }
    else if (nodeAIsGroup) {
        return 1;
    }
    else {
        return -1;
    }
}
exports.defaultGroupComparator = defaultGroupComparator;
