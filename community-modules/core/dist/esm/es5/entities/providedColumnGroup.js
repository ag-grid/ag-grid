/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { ColumnGroup } from "./columnGroup";
import { Column } from "./column";
import { EventService } from "../eventService";
var ProvidedColumnGroup = /** @class */ (function () {
    function ProvidedColumnGroup(colGroupDef, groupId, padding, level) {
        this.localEventService = new EventService();
        this.expandable = false;
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
        this.expanded = !!colGroupDef && !!colGroupDef.openByDefault;
        this.padding = padding;
        this.level = level;
    }
    ProvidedColumnGroup.prototype.setOriginalParent = function (originalParent) {
        this.originalParent = originalParent;
    };
    ProvidedColumnGroup.prototype.getOriginalParent = function () {
        return this.originalParent;
    };
    ProvidedColumnGroup.prototype.getLevel = function () {
        return this.level;
    };
    ProvidedColumnGroup.prototype.isVisible = function () {
        // return true if at least one child is visible
        if (this.children) {
            return this.children.some(function (child) { return child.isVisible(); });
        }
        return false;
    };
    ProvidedColumnGroup.prototype.isPadding = function () {
        return this.padding;
    };
    ProvidedColumnGroup.prototype.setExpanded = function (expanded) {
        this.expanded = expanded === undefined ? false : expanded;
        var event = {
            type: ProvidedColumnGroup.EVENT_EXPANDED_CHANGED
        };
        this.localEventService.dispatchEvent(event);
    };
    ProvidedColumnGroup.prototype.isExpandable = function () {
        return this.expandable;
    };
    ProvidedColumnGroup.prototype.isExpanded = function () {
        return this.expanded;
    };
    ProvidedColumnGroup.prototype.getGroupId = function () {
        return this.groupId;
    };
    ProvidedColumnGroup.prototype.getId = function () {
        return this.getGroupId();
    };
    ProvidedColumnGroup.prototype.setChildren = function (children) {
        this.children = children;
    };
    ProvidedColumnGroup.prototype.getChildren = function () {
        return this.children;
    };
    ProvidedColumnGroup.prototype.getColGroupDef = function () {
        return this.colGroupDef;
    };
    ProvidedColumnGroup.prototype.getLeafColumns = function () {
        var result = [];
        this.addLeafColumns(result);
        return result;
    };
    ProvidedColumnGroup.prototype.addLeafColumns = function (leafColumns) {
        if (!this.children) {
            return;
        }
        this.children.forEach(function (child) {
            if (child instanceof Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ProvidedColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    };
    ProvidedColumnGroup.prototype.getColumnGroupShow = function () {
        var colGroupDef = this.colGroupDef;
        if (!colGroupDef) {
            return;
        }
        return colGroupDef.columnGroupShow;
    };
    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group
    ProvidedColumnGroup.prototype.setupExpandable = function () {
        var _this = this;
        this.setExpandable();
        // note - we should be removing this event listener
        this.getLeafColumns().forEach(function (col) { return col.addEventListener(Column.EVENT_VISIBLE_CHANGED, _this.onColumnVisibilityChanged.bind(_this)); });
    };
    ProvidedColumnGroup.prototype.setExpandable = function () {
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
                type: ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED
            };
            this.localEventService.dispatchEvent(event_1);
        }
    };
    ProvidedColumnGroup.prototype.findChildrenRemovingPadding = function () {
        var res = [];
        var process = function (items) {
            items.forEach(function (item) {
                // if padding, we add this children instead of the padding
                var skipBecausePadding = item instanceof ProvidedColumnGroup && item.isPadding();
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
    ProvidedColumnGroup.prototype.onColumnVisibilityChanged = function () {
        this.setExpandable();
    };
    ProvidedColumnGroup.prototype.addEventListener = function (eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    };
    ProvidedColumnGroup.prototype.removeEventListener = function (eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    };
    ProvidedColumnGroup.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED = 'expandableChanged';
    return ProvidedColumnGroup;
}());
export { ProvidedColumnGroup };
