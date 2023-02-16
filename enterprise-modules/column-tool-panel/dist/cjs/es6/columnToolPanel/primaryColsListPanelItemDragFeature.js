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
const PRIMARY_COLS_LIST_ITEM_HOVERED = 'ag-list-item-hovered';
class PrimaryColsListPanelItemDragFeature extends core_1.BeanStub {
    constructor(comp, virtualList) {
        super();
        this.comp = comp;
        this.virtualList = virtualList;
        this.currentDragColumn = null;
        this.lastHoveredColumnItem = null;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START, this.columnPanelItemDragStart.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END, this.columnPanelItemDragEnd.bind(this));
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
            isInterestedIn: (type) => type === core_1.DragSourceType.ToolPanel,
            getIconName: () => core_1.DragAndDropService[this.moveBlocked ? 'ICON_NOT_ALLOWED' : 'ICON_MOVE'],
            getContainer: () => this.comp.getGui(),
            onDragging: (e) => this.onDragging(e),
            onDragStop: () => this.onDragStop(),
            onDragLeave: () => this.onDragLeave()
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    }
    createAutoScrollService() {
        const virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new core_1.AutoScrollService({
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
        core_1._.radioCssClass(el, `${PRIMARY_COLS_LIST_ITEM_HOVERED}`);
        core_1._.radioCssClass(el, `ag-item-highlight-${hoveredColumnItem.position}`);
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
        if (this.currentDragColumn instanceof core_1.ProvidedColumnGroup) {
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
        if (columnItemComponent instanceof toolPanelColumnGroupComp_1.ToolPanelColumnGroupComp) {
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
    core_1.Autowired('columnModel')
], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('dragAndDropService')
], PrimaryColsListPanelItemDragFeature.prototype, "dragAndDropService", void 0);
__decorate([
    core_1.PostConstruct
], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);
exports.PrimaryColsListPanelItemDragFeature = PrimaryColsListPanelItemDragFeature;
