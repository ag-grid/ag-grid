/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generic_1 = require("./utils/generic");
function defaultGroupComparator(valueA, valueB, nodeA, nodeB, accentedCompare = false) {
    console.warn('AG Grid: Since ag-grid 11.0.0 defaultGroupComparator is not necessary. You can remove this from your colDef');
    const nodeAIsGroup = generic_1.exists(nodeA) && nodeA.group;
    const nodeBIsGroup = generic_1.exists(nodeB) && nodeB.group;
    const bothAreGroups = nodeAIsGroup && nodeBIsGroup;
    const bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;
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
