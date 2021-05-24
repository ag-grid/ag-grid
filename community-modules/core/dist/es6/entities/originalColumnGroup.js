/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { ColumnGroup } from "./columnGroup";
import { Column } from "./column";
import { EventService } from "../eventService";
var OriginalColumnGroup = /** @class */ (function () {
    function OriginalColumnGroup(colGroupDef, groupId, padding, level) {
        this.localEventService = new EventService();
        this.expandable = false;
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
        this.expanded = !!colGroupDef && !!colGroupDef.openByDefault;
        this.padding = padding;
        this.level = level;
    }
    OriginalColumnGroup.prototype.setOriginalParent = function (originalParent) {
        this.originalParent = originalParent;
    };
    OriginalColumnGroup.prototype.getOriginalParent = function () {
        return this.originalParent;
    };
    OriginalColumnGroup.prototype.getLevel = function () {
        return this.level;
    };
    OriginalColumnGroup.prototype.isVisible = function () {
        // return true if at least one child is visible
        if (this.children) {
            return this.children.some(function (child) { return child.isVisible(); });
        }
        return false;
    };
    OriginalColumnGroup.prototype.isPadding = function () {
        return this.padding;
    };
    OriginalColumnGroup.prototype.setExpanded = function (expanded) {
        this.expanded = expanded === undefined ? false : expanded;
        var event = {
            type: OriginalColumnGroup.EVENT_EXPANDED_CHANGED
        };
        this.localEventService.dispatchEvent(event);
    };
    OriginalColumnGroup.prototype.isExpandable = function () {
        return this.expandable;
    };
    OriginalColumnGroup.prototype.isExpanded = function () {
        return this.expanded;
    };
    OriginalColumnGroup.prototype.getGroupId = function () {
        return this.groupId;
    };
    OriginalColumnGroup.prototype.getId = function () {
        return this.getGroupId();
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
    OriginalColumnGroup.prototype.getLeafColumns = function () {
        var result = [];
        this.addLeafColumns(result);
        return result;
    };
    OriginalColumnGroup.prototype.addLeafColumns = function (leafColumns) {
        if (!this.children) {
            return;
        }
        this.children.forEach(function (child) {
            if (child instanceof Column) {
                leafColumns.push(child);
            }
            else if (child instanceof OriginalColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    };
    OriginalColumnGroup.prototype.getColumnGroupShow = function () {
        var colGroupDef = this.colGroupDef;
        if (!colGroupDef) {
            return;
        }
        return colGroupDef.columnGroupShow;
    };
    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group
    OriginalColumnGroup.prototype.setupExpandable = function () {
        var _this = this;
        this.setExpandable();
        // note - we should be removing this event listener
        this.getLeafColumns().forEach(function (col) { return col.addEventListener(Column.EVENT_VISIBLE_CHANGED, _this.onColumnVisibilityChanged.bind(_this)); });
    };
    OriginalColumnGroup.prototype.setExpandable = function () {
        if (this.isPadding()) {
            return;
        }
        // want to make sure the group doesn't disappear when it's open
        var atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        var atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        var atLeastOneChangeable = false;
        var children = this.findChildrenRemovingPadding();
        for (var i = 0, j = children.length; i < j; i++) {
            var abstractColumn = children[i];
            if (!abstractColumn.isVisible()) {
                continue;
            }
            // if the abstractColumn is a grid generated group, there will be no colDef
            var headerGroupShow = abstractColumn.getColumnGroupShow();
            if (headerGroupShow === ColumnGroup.HEADER_GROUP_SHOW_OPEN) {
                atLeastOneShowingWhenOpen = true;
                atLeastOneChangeable = true;
            }
            else if (headerGroupShow === ColumnGroup.HEADER_GROUP_SHOW_CLOSED) {
                atLeastOneShowingWhenClosed = true;
                atLeastOneChangeable = true;
            }
            else {
                atLeastOneShowingWhenOpen = true;
                atLeastOneShowingWhenClosed = true;
            }
        }
        var expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
        if (this.expandable !== expandable) {
            this.expandable = expandable;
            var event_1 = {
                type: OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED
            };
            this.localEventService.dispatchEvent(event_1);
        }
    };
    OriginalColumnGroup.prototype.findChildrenRemovingPadding = function () {
        var res = [];
        var process = function (items) {
            items.forEach(function (item) {
                // if padding, we add this children instead of the padding
                var skipBecausePadding = item instanceof OriginalColumnGroup && item.isPadding();
                if (skipBecausePadding) {
                    process(item.children);
                }
                else {
                    res.push(item);
                }
            });
        };
        process(this.children);
        return res;
    };
    OriginalColumnGroup.prototype.onColumnVisibilityChanged = function () {
        this.setExpandable();
    };
    OriginalColumnGroup.prototype.addEventListener = function (eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    };
    OriginalColumnGroup.prototype.removeEventListener = function (eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    };
    OriginalColumnGroup.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED = 'expandableChanged';
    return OriginalColumnGroup;
}());
export { OriginalColumnGroup };
