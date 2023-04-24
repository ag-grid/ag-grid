import { EventService } from "@ag-grid-community/core";
var ColumnModelItem = /** @class */ (function () {
    function ColumnModelItem(displayName, columnOrGroup, dept, group, expanded) {
        if (group === void 0) { group = false; }
        this.eventService = new EventService();
        this.displayName = displayName;
        this.dept = dept;
        this.group = group;
        if (group) {
            this.columnGroup = columnOrGroup;
            this.expanded = expanded;
            this.children = [];
        }
        else {
            this.column = columnOrGroup;
        }
    }
    ColumnModelItem.prototype.isGroup = function () { return this.group; };
    ColumnModelItem.prototype.getDisplayName = function () { return this.displayName; };
    ColumnModelItem.prototype.getColumnGroup = function () { return this.columnGroup; };
    ColumnModelItem.prototype.getColumn = function () { return this.column; };
    ColumnModelItem.prototype.getDept = function () { return this.dept; };
    ColumnModelItem.prototype.isExpanded = function () { return !!this.expanded; };
    ColumnModelItem.prototype.getChildren = function () { return this.children; };
    ColumnModelItem.prototype.isPassesFilter = function () { return this.passesFilter; };
    ColumnModelItem.prototype.setExpanded = function (expanded) {
        if (expanded === this.expanded) {
            return;
        }
        this.expanded = expanded;
        this.eventService.dispatchEvent({ type: ColumnModelItem.EVENT_EXPANDED_CHANGED });
    };
    ColumnModelItem.prototype.setPassesFilter = function (passesFilter) {
        this.passesFilter = passesFilter;
    };
    ColumnModelItem.prototype.addEventListener = function (eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    };
    ColumnModelItem.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    ColumnModelItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    return ColumnModelItem;
}());
export { ColumnModelItem };
