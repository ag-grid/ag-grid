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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uTW9kZWxJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbHVtblRvb2xQYW5lbC9jb2x1bW5Nb2RlbEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFlBQVksRUFHZixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE1BQU0sT0FBTyxlQUFlO0lBZ0J4QixZQUNJLFdBQTBCLEVBQzFCLGFBQTJDLEVBQzNDLElBQVksRUFDWixLQUFLLEdBQUcsS0FBSyxFQUNiLFFBQWtCO1FBbkJkLGlCQUFZLEdBQWlCLElBQUksWUFBWSxFQUFFLENBQUM7UUFxQnBELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFvQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO2FBQU07WUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLGFBQXVCLENBQUM7U0FDekM7SUFDTCxDQUFDO0lBRU0sT0FBTyxLQUFjLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDekMsY0FBYyxLQUFvQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzVELGNBQWMsS0FBMEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNsRSxTQUFTLEtBQWEsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMzQyxPQUFPLEtBQWEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2QyxVQUFVLEtBQWMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDakQsV0FBVyxLQUF3QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzFELGNBQWMsS0FBYyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBRXZELFdBQVcsQ0FBQyxRQUFpQjtRQUNoQyxJQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxzQkFBc0IsRUFBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVNLGVBQWUsQ0FBQyxZQUFxQjtRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUNyQyxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxRQUFrQjtRQUN6RCxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU0sbUJBQW1CLENBQUMsU0FBaUIsRUFBRSxRQUFrQjtRQUM1RCxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMvRCxDQUFDOztBQXpEYSxzQ0FBc0IsR0FBRyxpQkFBaUIsQ0FBQyJ9