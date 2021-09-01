import {
    AutoScrollService, 
    Autowired,
    BeanStub,
    Column,
    ColumnGroup,
    ColumnModel,
    DragAndDropService,
    DraggingEvent,
    DragSourceType,
    DropTarget,
    Events,
    PostConstruct,
    VirtualList,
    _
} from "@ag-grid-community/core";

import { PrimaryColsListPanel } from "./primaryColsListPanel";
import { ToolPanelColumnComp } from "./toolPanelColumnComp";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";

const PRIMARY_COLS_LIST_ITEM_HOVERED = 'ag-column-list-item-hovered';

type DragColumnItem = {
    rowIndex: number,
    position: 'top' | 'bottom',
    component: ToolPanelColumnGroupComp | ToolPanelColumnComp
};

export class PrimaryColsListPanelItemDragFeature extends BeanStub {
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private currentDragColumn: Column | ColumnGroup | null = null;
    private lastHoveredColumnItem: DragColumnItem | null = null;
    private autoScrollService: AutoScrollService;

    constructor(
        private readonly comp: PrimaryColsListPanel,
        private readonly virtualList: VirtualList
    ) { super(); }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START, this.columnPanelItemDragStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END, this.columnPanelItemDragEnd.bind(this));

        this.createDropTarget();
        this.createAutoScrollService();
    }

    private columnPanelItemDragStart({ column }: { column: Column | ColumnGroup }): void {
        this.currentDragColumn = column;
    }

    private columnPanelItemDragEnd(): void {
        window.setTimeout(() => { this.currentDragColumn = null; }, 10);
    }

    private createDropTarget(): void {
        const dropTarget: DropTarget = {
            isInterestedIn: (type: DragSourceType) => type === DragSourceType.ToolPanel,
            getIconName:() => DragAndDropService.ICON_MOVE,
            getContainer: () => this.comp.getGui(),
            onDragging: (e) => this.onDragging(e),
            onDragStop: (e) => this.onDragStop(e),
            onDragLeave: (e) => this.onDragLeave(e)
        };

        this.dragAndDropService.addDropTarget(dropTarget);
    }

    private createAutoScrollService(): void {
        const virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: () => virtualListGui.scrollTop,
            setVerticalPosition: (position) => virtualListGui.scrollTop = position
        });
    }

    private onDragging(e: DraggingEvent) {
        if (!this.currentDragColumn) { return; }

        const hoveredColumnItem = this.getDragColumnItem(e);
        const comp = this.virtualList.getComponentAt(hoveredColumnItem.rowIndex);

        if (!comp) { return; }

        const el = comp!.getGui().parentElement as HTMLElement

        if (
            this.lastHoveredColumnItem &&
            this.lastHoveredColumnItem.rowIndex === hoveredColumnItem.rowIndex &&
            this.lastHoveredColumnItem.position === hoveredColumnItem.position
            ) { return; }

        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredColumnItem = hoveredColumnItem;

        _.radioCssClass(el, `${PRIMARY_COLS_LIST_ITEM_HOVERED}`);
        _.radioCssClass(el, `ag-item-highlight-${hoveredColumnItem.position}`);
    }

    private getDragColumnItem(e: DraggingEvent): DragColumnItem {
        const virtualListGui = this.virtualList.getGui();
        const paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop as string);
        const rowHeight = this.virtualList.getRowHeight();
        const scrollTop = this.virtualList.getScrollTop();
        const rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        const maxLen = this.comp.getDisplayedColsList().length - 1;
        const normalizedRowIndex = Math.trunc(Math.min(maxLen, rowIndex));

        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex) as ToolPanelColumnGroupComp | ToolPanelColumnComp
        };
    }

    private onDragStop(e: DraggingEvent) {
        const targetIndex: number | null = this.getTargetIndex();
        const columnsToMove: Column[] = this.getColumnsToMove();

        if (targetIndex != null) { 
            this.columnModel.moveColumns(columnsToMove, targetIndex);
        }

        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }

    private getTargetIndex(): number | null {
        if (!this.lastHoveredColumnItem) { return null; }
        const columnItemComponent = this.lastHoveredColumnItem.component;
        let isBefore = this.lastHoveredColumnItem.position === 'top';

        let targetColumn: Column;

        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            const columns = columnItemComponent.getColumns();
            targetColumn =  columns[0];
            isBefore = true;
        } else {
            targetColumn = columnItemComponent.getColumn();
        }

        const targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);

        return isBefore ? Math.max(0, targetColumnIndex) : targetColumnIndex + 1;
    }

    private getColumnsToMove(): Column[] {
        if (this.currentDragColumn instanceof ColumnGroup) {
            return this.currentDragColumn.getLeafColumns();
        }

        return [this.currentDragColumn!];
    }

    private onDragLeave(e: DraggingEvent) {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }

    private clearHoveredItems(): void {
        const virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll(`.${PRIMARY_COLS_LIST_ITEM_HOVERED}`).forEach(el => {
            [
                PRIMARY_COLS_LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(cls => {
                _.removeCssClass((el as HTMLElement), cls);
            });
        });
        this.lastHoveredColumnItem = null;
    }
}