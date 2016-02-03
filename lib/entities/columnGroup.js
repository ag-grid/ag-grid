/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.0-alpha.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var column_1 = require("./column");
var ColumnGroup = (function () {
    function ColumnGroup(colGroupDef, groupId, instanceId) {
        // depends on the open/closed state of the group, only displaying columns are stored here
        this.displayedChildren = [];
        this.expandable = false;
        this.expanded = false;
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
        this.instanceId = instanceId;
    }
    // returns header name if it exists, otherwise null. if will not exist if
    // this group is a padding group, as they don't have colGroupDef's
    ColumnGroup.prototype.getHeaderName = function () {
        if (this.colGroupDef) {
            return this.colGroupDef.headerName;
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
    ColumnGroup.prototype.setExpanded = function (expanded) {
        this.expanded = expanded;
    };
    ColumnGroup.prototype.isExpandable = function () {
        return this.expandable;
    };
    ColumnGroup.prototype.isExpanded = function () {
        return this.expanded;
    };
    ColumnGroup.prototype.getColGroupDef = function () {
        return this.colGroupDef;
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
    ColumnGroup.prototype.getMinimumWidth = function () {
        var result = 0;
        this.displayedChildren.forEach(function (groupChild) {
            result += groupChild.getMinimumWidth();
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
    ColumnGroup.prototype.getDisplayedLeafColumns = function () {
        var result = [];
        this.addDisplayedLeafColumns(result);
        return result;
    };
    ColumnGroup.prototype.getDefinition = function () {
        return this.colGroupDef;
    };
    ColumnGroup.prototype.addDisplayedLeafColumns = function (leafColumns) {
        this.displayedChildren.forEach(function (child) {
            if (child instanceof column_1.default) {
                leafColumns.push(child);
            }
            else if (child instanceof ColumnGroup) {
                child.addDisplayedLeafColumns(leafColumns);
            }
        });
    };
    ColumnGroup.prototype.getChildren = function () {
        return this.children;
    };
    ColumnGroup.prototype.getColumnGroupShow = function () {
        if (this.colGroupDef) {
            return this.colGroupDef.columnGroupShow;
        }
        else {
            // if there is no col def, then this must be a padding
            // group, which means we exactly only child. we then
            // take the value from the child and push it up, making
            // this group 'invisible'.
            return this.children[0].getColumnGroupShow();
        }
    };
    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group
    ColumnGroup.prototype.calculateExpandable = function () {
        // want to make sure the group doesn't disappear when it's open
        var atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        var atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        var atLeastOneChangeable = false;
        for (var i = 0, j = this.children.length; i < j; i++) {
            var abstractColumn = this.children[i];
            // if the abstractColumn is a grid generated group, there will be no colDef
            var headerGroupShow = abstractColumn.getColumnGroupShow();
            if (headerGroupShow === 'open') {
                atLeastOneShowingWhenOpen = true;
                atLeastOneChangeable = true;
            }
            else if (headerGroupShow === 'closed') {
                atLeastOneShowingWhenClosed = true;
                atLeastOneChangeable = true;
            }
            else {
                atLeastOneShowingWhenOpen = true;
                atLeastOneShowingWhenClosed = true;
            }
        }
        this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
    };
    ColumnGroup.prototype.calculateDisplayedColumns = function () {
        // clear out last time we calculated
        this.displayedChildren = [];
        // it not expandable, everything is visible
        if (!this.expandable) {
            this.displayedChildren = this.children;
            return;
        }
        // and calculate again
        for (var i = 0, j = this.children.length; i < j; i++) {
            var abstractColumn = this.children[i];
            var headerGroupShow = abstractColumn.getColumnGroupShow();
            switch (headerGroupShow) {
                case 'open':
                    // when set to open, only show col if group is open
                    if (this.expanded) {
                        this.displayedChildren.push(abstractColumn);
                    }
                    break;
                case 'closed':
                    // when set to open, only show col if group is open
                    if (!this.expanded) {
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
    return ColumnGroup;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ColumnGroup;
