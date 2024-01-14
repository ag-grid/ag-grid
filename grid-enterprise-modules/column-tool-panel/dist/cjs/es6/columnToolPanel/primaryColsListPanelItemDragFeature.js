"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryColsListPanelItemDragFeature = void 0;
const core_1 = require("@ag-grid-community/core");
const toolPanelColumnGroupComp_1 = require("./toolPanelColumnGroupComp");
class PrimaryColsListPanelItemDragFeature extends core_1.BeanStub {
    constructor(comp, virtualList) {
        super();
        this.comp = comp;
        this.virtualList = virtualList;
    }
    postConstruct() {
        this.createManagedBean(new core_1.VirtualListDragFeature(this.comp, this.virtualList, {
            dragSourceType: core_1.DragSourceType.ToolPanel,
            listItemDragStartEvent: core_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
            listItemDragEndEvent: core_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
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
        if (currentDragValue instanceof core_1.ProvidedColumnGroup) {
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
        if (columnItemComponent instanceof toolPanelColumnGroupComp_1.ToolPanelColumnGroupComp) {
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
    (0, core_1.Autowired)('columnModel')
], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
__decorate([
    (0, core_1.Autowired)('gridOptionsService')
], PrimaryColsListPanelItemDragFeature.prototype, "gridOptionsService", void 0);
__decorate([
    core_1.PostConstruct
], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);
exports.PrimaryColsListPanelItemDragFeature = PrimaryColsListPanelItemDragFeature;
