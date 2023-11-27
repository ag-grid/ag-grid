import { EventService } from "@ag-grid-community/core";
export class ColumnModelItem {
    constructor(displayName, columnOrGroup, dept, group = false, expanded) {
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
    isGroup() { return this.group; }
    getDisplayName() { return this.displayName; }
    getColumnGroup() { return this.columnGroup; }
    getColumn() { return this.column; }
    getDept() { return this.dept; }
    isExpanded() { return !!this.expanded; }
    getChildren() { return this.children; }
    isPassesFilter() { return this.passesFilter; }
    setExpanded(expanded) {
        if (expanded === this.expanded) {
            return;
        }
        this.expanded = expanded;
        this.eventService.dispatchEvent({ type: ColumnModelItem.EVENT_EXPANDED_CHANGED });
    }
    setPassesFilter(passesFilter) {
        this.passesFilter = passesFilter;
    }
    addEventListener(eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    }
    removeEventListener(eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    }
}
ColumnModelItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';
