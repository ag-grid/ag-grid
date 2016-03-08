/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var column_1 = require("./column");
var ColumnGroup = (function () {
    function ColumnGroup(originalColumnGroup, groupId, instanceId) {
        // depends on the open/closed state of the group, only displaying columns are stored here
        this.displayedChildren = [];
        this.groupId = groupId;
        this.instanceId = instanceId;
        this.originalColumnGroup = originalColumnGroup;
    }
    // returns header name if it exists, otherwise null. if will not exist if
    // this group is a padding group, as they don't have colGroupDef's
    ColumnGroup.prototype.getHeaderName = function () {
        if (this.originalColumnGroup.getColGroupDef()) {
            return this.originalColumnGroup.getColGroupDef().headerName;
        }
        else {
            return null;
        }
    };
    ColumnGroup.prototype.getGroupId = function () {
        return this.groupId;
    };
    ColumnGroup.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    ColumnGroup.prototype.isChildInThisGroupDeepSearch = function (wantedChild) {
        var result = false;
        this.children.forEach(function (foundChild) {
            if (wantedChild === foundChild) {
                result = true;
            }
            if (foundChild instanceof ColumnGroup) {
                if (foundChild.isChildInThisGroupDeepSearch(wantedChild)) {
                    result = true;
                }
            }
        });
        return result;
    };
    ColumnGroup.prototype.getActualWidth = function () {
        var groupActualWidth = 0;
        if (this.displayedChildren) {
            this.displayedChildren.forEach(function (child) {
                groupActualWidth += child.getActualWidth();
            });
        }
        return groupActualWidth;
    };
    ColumnGroup.prototype.getMinWidth = function () {
        var result = 0;
        this.displayedChildren.forEach(function (groupChild) {
            result += groupChild.getMinWidth();
        });
        return result;
    };
    ColumnGroup.prototype.addChild = function (child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    };
    ColumnGroup.prototype.getDisplayedChildren = function () {
        return this.displayedChildren;
    };
    ColumnGroup.prototype.getLeafColumns = function () {
        var result = [];
        this.addLeafColumns(result);
        return result;
    };
    ColumnGroup.prototype.getDisplayedLeafColumns = function () {
        var result = [];
        this.addDisplayedLeafColumns(result);
        return result;
    };
    // why two methods here doing the same thing?
    ColumnGroup.prototype.getDefinition = function () {
        return this.originalColumnGroup.getColGroupDef();
    };
    ColumnGroup.prototype.getColGroupDef = function () {
        return this.originalColumnGroup.getColGroupDef();
    };
    ColumnGroup.prototype.isExpandable = function () {
        return this.originalColumnGroup.isExpandable();
    };
    ColumnGroup.prototype.isExpanded = function () {
        return this.originalColumnGroup.isExpanded();
    };
    ColumnGroup.prototype.setExpanded = function (expanded) {
        this.originalColumnGroup.setExpanded(expanded);
    };
    ColumnGroup.prototype.addDisplayedLeafColumns = function (leafColumns) {
        this.displayedChildren.forEach(function (child) {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ColumnGroup) {
                child.addDisplayedLeafColumns(leafColumns);
            }
        });
    };
    ColumnGroup.prototype.addLeafColumns = function (leafColumns) {
        this.children.forEach(function (child) {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    };
    ColumnGroup.prototype.getChildren = function () {
        return this.children;
    };
    ColumnGroup.prototype.getColumnGroupShow = function () {
        return this.originalColumnGroup.getColumnGroupShow();
    };
    ColumnGroup.prototype.calculateDisplayedColumns = function () {
        // clear out last time we calculated
        this.displayedChildren = [];
        // it not expandable, everything is visible
        if (!this.originalColumnGroup.isExpandable()) {
            this.displayedChildren = this.children;
            return;
        }
        // and calculate again
        for (var i = 0, j = this.children.length; i < j; i++) {
            var abstractColumn = this.children[i];
            var headerGroupShow = abstractColumn.getColumnGroupShow();
            switch (headerGroupShow) {
                case ColumnGroup.HEADER_GROUP_SHOW_OPEN:
                    // when set to open, only show col if group is open
                    if (this.originalColumnGroup.isExpanded()) {
                        this.displayedChildren.push(abstractColumn);
                    }
                    break;
                case ColumnGroup.HEADER_GROUP_SHOW_CLOSED:
                    // when set to open, only show col if group is open
                    if (!this.originalColumnGroup.isExpanded()) {
                        this.displayedChildren.push(abstractColumn);
                    }
                    break;
                default:
                    // default is always show the column
                    this.displayedChildren.push(abstractColumn);
                    break;
            }
        }
    };
    ColumnGroup.HEADER_GROUP_SHOW_OPEN = 'open';
    ColumnGroup.HEADER_GROUP_SHOW_CLOSED = 'closed';
    return ColumnGroup;
})();
exports.ColumnGroup = ColumnGroup;
