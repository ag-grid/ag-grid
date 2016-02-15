/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('./utils');
function defaultGroupComparator(valueA, valueB, nodeA, nodeB) {
    var bothAreGroups = nodeA.group && nodeB.group;
    var bothAreNormal = !nodeA.group && !nodeB.group;
    if (bothAreGroups) {
        return utils_1.default.defaultComparator(nodeA.key, nodeB.key);
    }
    else if (bothAreNormal) {
        return utils_1.default.defaultComparator(valueA, valueB);
    }
    else if (nodeA.group) {
        return 1;
    }
    else {
        return -1;
    }
}
exports.defaultGroupComparator = defaultGroupComparator;
