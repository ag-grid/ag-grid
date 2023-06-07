var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AutoScrollService, Autowired, BeanStub, DragAndDropService, DragSourceType, Events, ProvidedColumnGroup, PostConstruct, _ } from "@ag-grid-community/core";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";
const PRIMARY_COLS_LIST_ITEM_HOVERED = 'ag-list-item-hovered';
export class PrimaryColsListPanelItemDragFeature extends BeanStub {
    constructor(comp, virtualList) {
        super();
        this.comp = comp;
        this.virtualList = virtualList;
        this.currentDragColumn = null;
        this.lastHoveredColumnItem = null;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START, this.columnPanelItemDragStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END, this.columnPanelItemDragEnd.bind(this));
        this.createDropTarget();
        this.createAutoScrollService();
    }
    columnPanelItemDragStart({ column }) {
        this.currentDragColumn = column;
        const currentColumns = this.getCurrentColumns();
        const hasNotMovable = currentColumns.find(col => {
            const colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });
        if (hasNotMovable) {
            this.moveBlocked = true;
        }
    }
    columnPanelItemDragEnd() {
        window.setTimeout(() => {
            this.currentDragColumn = null;
            this.moveBlocked = false;
        }, 10);
    }
    createDropTarget() {
        const dropTarget = {
            isInterestedIn: (type) => type === DragSourceType.ToolPanel,
            getIconName: () => DragAndDropService[this.moveBlocked ? 'ICON_NOT_ALLOWED' : 'ICON_MOVE'],
            getContainer: () => this.comp.getGui(),
            onDragging: (e) => this.onDragging(e),
            onDragStop: () => this.onDragStop(),
            onDragLeave: () => this.onDragLeave()
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    }
    createAutoScrollService() {
        const virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: () => virtualListGui.scrollTop,
            setVerticalPosition: (position) => virtualListGui.scrollTop = position
        });
    }
    onDragging(e) {
        if (!this.currentDragColumn || this.moveBlocked) {
            return;
        }
        const hoveredColumnItem = this.getDragColumnItem(e);
        const comp = this.virtualList.getComponentAt(hoveredColumnItem.rowIndex);
        if (!comp) {
            return;
        }
        const el = comp.getGui().parentElement;
        if (this.lastHoveredColumnItem &&
            this.lastHoveredColumnItem.rowIndex === hoveredColumnItem.rowIndex &&
            this.lastHoveredColumnItem.position === hoveredColumnItem.position) {
            return;
        }
        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredColumnItem = hoveredColumnItem;
        _.radioCssClass(el, `${PRIMARY_COLS_LIST_ITEM_HOVERED}`);
        _.radioCssClass(el, `ag-item-highlight-${hoveredColumnItem.position}`);
    }
    getDragColumnItem(e) {
        const virtualListGui = this.virtualList.getGui();
        const paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
        const rowHeight = this.virtualList.getRowHeight();
        const scrollTop = this.virtualList.getScrollTop();
        const rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        const maxLen = this.comp.getDisplayedColsList().length - 1;
        const normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;
        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex)
        };
    }
    onDragStop() {
        if (this.moveBlocked) {
            return;
        }
        const targetIndex = this.getTargetIndex();
        const columnsToMove = this.getCurrentColumns();
        if (targetIndex != null) {
            this.columnModel.moveColumns(columnsToMove, targetIndex, 'toolPanelUi');
        }
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }
    getMoveDiff(end) {
        const allColumns = this.columnModel.getAllGridColumns();
        const currentColumns = this.getCurrentColumns();
        const currentColumn = currentColumns[0];
        const span = currentColumns.length;
        const currentIndex = allColumns.indexOf(currentColumn);
        if (currentIndex < end) {
            return span;
        }
        return 0;
    }
    getCurrentColumns() {
        if (this.currentDragColumn instanceof ProvidedColumnGroup) {
            return this.currentDragColumn.getLeafColumns();
        }
        return [this.currentDragColumn];
    }
    getTargetIndex() {
        if (!this.lastHoveredColumnItem) {
            return null;
        }
        const columnItemComponent = this.lastHoveredColumnItem.component;
        let isBefore = this.lastHoveredColumnItem.position === 'top';
        let targetColumn;
        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            const columns = columnItemComponent.getColumns();
            targetColumn = columns[0];
            isBefore = true;
        }
        else {
            targetColumn = columnItemComponent.getColumn();
        }
        const targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);
        const adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        const diff = this.getMoveDiff(adjustedTarget);
        return adjustedTarget - diff;
    }
    onDragLeave() {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }
    clearHoveredItems() {
        const virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll(`.${PRIMARY_COLS_LIST_ITEM_HOVERED}`).forEach(el => {
            [
                PRIMARY_COLS_LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(cls => {
                el.classList.remove(cls);
            });
        });
        this.lastHoveredColumnItem = null;
    }
}
__decorate([
    Autowired('columnModel')
], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
__decorate([
    Autowired('dragAndDropService')
], PrimaryColsListPanelItemDragFeature.prototype, "dragAndDropService", void 0);
__decorate([
    PostConstruct
], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWFyeUNvbHNMaXN0UGFuZWxJdGVtRHJhZ0ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL3ByaW1hcnlDb2xzTGlzdFBhbmVsSXRlbURyYWdGZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULFFBQVEsRUFJUixrQkFBa0IsRUFFbEIsY0FBYyxFQUVkLE1BQU0sRUFDTixtQkFBbUIsRUFDbkIsYUFBYSxFQUViLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBSWpDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXRFLE1BQU0sOEJBQThCLEdBQUcsc0JBQXNCLENBQUM7QUFROUQsTUFBTSxPQUFPLG1DQUFvQyxTQUFRLFFBQVE7SUFTN0QsWUFDcUIsSUFBMEIsRUFDMUIsV0FBd0I7UUFDekMsS0FBSyxFQUFFLENBQUM7UUFGUyxTQUFJLEdBQUosSUFBSSxDQUFzQjtRQUMxQixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQVByQyxzQkFBaUIsR0FBd0MsSUFBSSxDQUFDO1FBQzlELDBCQUFxQixHQUEwQixJQUFJLENBQUM7SUFPL0MsQ0FBQztJQUdOLGFBQWE7UUFDakIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGtDQUFrQyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTVILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hC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