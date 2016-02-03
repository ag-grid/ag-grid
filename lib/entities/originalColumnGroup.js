/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.0-alpha.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var OriginalColumnGroup = (function () {
    function OriginalColumnGroup(colGroupDef, groupId) {
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
    }
    OriginalColumnGroup.prototype.getGroupId = function () {
        return this.groupId;
    };
    OriginalColumnGroup.prototype.setChildren = function (children) {
        this.children = children;
    };
    OriginalColumnGroup.prototype.getChildren = function () {
        return this.children;
    };
    OriginalColumnGroup.prototype.getColGroupDef = function () {
        return this.colGroupDef;
    };
    return OriginalColumnGroup;
})();
exports.OriginalColumnGroup = OriginalColumnGroup;
