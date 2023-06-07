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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uTW9kZWxJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbHVtblRvb2xQYW5lbC9jb2x1bW5Nb2RlbEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFlBQVksRUFHZixNQUFNLHlCQUF5QixDQUFDO0FBRWpDO0lBZ0JJLHlCQUNJLFdBQTBCLEVBQzFCLGFBQTJDLEVBQzNDLElBQVksRUFDWixLQUFhLEVBQ2IsUUFBa0I7UUFEbEIsc0JBQUEsRUFBQSxhQUFhO1FBbEJULGlCQUFZLEdBQWlCLElBQUksWUFBWSxFQUFFLENBQUM7UUFxQnBELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFvQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO2FBQU07WUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLGFBQXVCLENBQUM7U0FDekM7SUFDTCxDQUFDO0lBRU0saUNBQU8sR0FBZCxjQUE0QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLHdDQUFjLEdBQXJCLGNBQXlDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDNUQsd0NBQWMsR0FBckIsY0FBK0MsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNsRSxtQ0FBUyxHQUFoQixjQUE2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzNDLGlDQUFPLEdBQWQsY0FBMkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2QyxvQ0FBVSxHQUFqQixjQUErQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNqRCxxQ0FBVyxHQUFsQixjQUEwQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzFELHdDQUFjLEdBQXJCLGNBQW1DLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFFdkQscUNBQVcsR0FBbEIsVUFBbUIsUUFBaUI7UUFDaEMsSUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUMzQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFDLElBQUksRUFBRSxlQUFlLENBQUMsc0JBQXNCLEVBQUMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFTSx5Q0FBZSxHQUF0QixVQUF1QixZQUFxQjtRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUNyQyxDQUFDO0lBRU0sMENBQWdCLEdBQXZCLFVBQXdCLFNBQWlCLEVBQUUsUUFBa0I7UUFDekQsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVNLDZDQUFtQixHQUExQixVQUEyQixTQUFpQixFQUFFLFFBQWtCO1FBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUF6RGEsc0NBQXNCLEdBQUcsaUJBQWlCLENBQUM7SUEyRDdELHNCQUFDO0NBQUEsQUEvREQsSUErREM7U0EvRFksZUFBZSJ9