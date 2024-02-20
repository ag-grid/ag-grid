var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, BeanStub, DragSourceType, Events, ProvidedColumnGroup, PostConstruct, VirtualListDragFeature } from "@ag-grid-community/core";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp.mjs";
export class PrimaryColsListPanelItemDragFeature extends BeanStub {
    constructor(comp, virtualList) {
        super();
        this.comp = comp;
        this.virtualList = virtualList;
    }
    postConstruct() {
        this.createManagedBean(new VirtualListDragFeature(this.comp, this.virtualList, {
            dragSourceType: DragSourceType.ToolPanel,
            listItemDragStartEvent: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
            listItemDragEndEvent: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
            eventSource: this.eventService,
            getCurrentDragValue: (listItemDragStartEvent) => this.getCurrentDragValue(listItemDragStartEvent),
            isMoveBlocked: (currentDragValue) => this.isMoveBlocked(currentDragValue),
            getNumRows: (comp) => comp.getDisplayedColsList().length,
            moveItem: (currentDragValue, lastHoveredListItem) => this.moveItem(currentDragValue, lastHoveredListItem)
        }));
    }
    getCurrentDragValue(listItemDragStartEvent) {
        return listItemDragStartEvent.column;
    }
    isMoveBlocked(currentDragValue) {
        const preventMoving = this.gridOptionsService.get('suppressMovableColumns');
        if (preventMoving) {
            return true;
        }
        const currentColumns = this.getCurrentColumns(currentDragValue);
        const hasNotMovable = currentColumns.find(col => {
            const colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });
        return !!hasNotMovable;
    }
    moveItem(currentDragValue, lastHoveredListItem) {
        const targetIndex = this.getTargetIndex(currentDragValue, lastHoveredListItem);
        const columnsToMove = this.getCurrentColumns(currentDragValue);
        if (targetIndex != null) {
            this.columnModel.moveColumns(columnsToMove, targetIndex, 'toolPanelUi');
        }
    }
    getMoveDiff(currentDragValue, end) {
        const allColumns = this.columnModel.getAllGridColumns();
        const currentColumns = this.getCurrentColumns(currentDragValue);
        const currentColumn = currentColumns[0];
        const span = currentColumns.length;
        const currentIndex = allColumns.indexOf(currentColumn);
        if (currentIndex < end) {
            return span;
        }
        return 0;
    }
    getCurrentColumns(currentDragValue) {
        if (currentDragValue instanceof ProvidedColumnGroup) {
            return currentDragValue.getLeafColumns();
        }
        return [currentDragValue];
    }
    getTargetIndex(currentDragValue, lastHoveredListItem) {
        if (!lastHoveredListItem) {
            return null;
        }
        const columnItemComponent = lastHoveredListItem.component;
        let isBefore = lastHoveredListItem.position === 'top';
        let targetColumn;
        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            const columns = columnItemComponent.getColumns();
            targetColumn = columns[0];
            isBefore = true;
        }
        else {
            targetColumn = columnItemComponent.getColumn();
        }
        // if the target col is in the cols to be moved, no index to move.
        const movingCols = this.getCurrentColumns(currentDragValue);
        if (movingCols.indexOf(targetColumn) !== -1) {
            return null;
        }
        const targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);
        const adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        const diff = this.getMoveDiff(currentDragValue, adjustedTarget);
        return adjustedTarget - diff;
    }
}
__decorate([
    Autowired('columnModel')
], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
__decorate([
    Autowired('gridOptionsService')
], PrimaryColsListPanelItemDragFeature.prototype, "gridOptionsService", void 0);
__decorate([
    PostConstruct
], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);
