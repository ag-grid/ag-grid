import type {
    BeanCollection,
    ColumnModel,
    ColumnMoveService,
    ColumnPanelItemDragStartEvent,
    InternalColumn,
    InternalProvidedColumnGroup,
    VirtualList,
    VirtualListDragItem,
} from '@ag-grid-community/core';
import {
    BeanStub,
    DragSourceType,
    Events,
    VirtualListDragFeature,
    isProvidedColumnGroup,
} from '@ag-grid-community/core';

import type { AgPrimaryColsList } from './agPrimaryColsList';
import type { ToolPanelColumnComp } from './toolPanelColumnComp';
import { ToolPanelColumnGroupComp } from './toolPanelColumnGroupComp';

export class PrimaryColsListPanelItemDragFeature extends BeanStub {
    private columnModel: ColumnModel;
    private columnMoveService: ColumnMoveService;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.columnModel = beans.columnModel;
        this.columnMoveService = beans.columnMoveService;
    }

    constructor(
        private readonly comp: AgPrimaryColsList,
        private readonly virtualList: VirtualList
    ) {
        super();
    }

    public postConstruct(): void {
        this.createManagedBean(
            new VirtualListDragFeature<
                AgPrimaryColsList,
                ToolPanelColumnGroupComp | ToolPanelColumnComp,
                InternalColumn | InternalProvidedColumnGroup,
                ColumnPanelItemDragStartEvent
            >(this.comp, this.virtualList, {
                dragSourceType: DragSourceType.ToolPanel,
                listItemDragStartEvent: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
                listItemDragEndEvent: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
                eventSource: this.eventService,
                getCurrentDragValue: (listItemDragStartEvent: ColumnPanelItemDragStartEvent) =>
                    this.getCurrentDragValue(listItemDragStartEvent),
                isMoveBlocked: (currentDragValue: InternalColumn | InternalProvidedColumnGroup | null) =>
                    this.isMoveBlocked(currentDragValue),
                getNumRows: (comp: AgPrimaryColsList) => comp.getDisplayedColsList().length,
                moveItem: (
                    currentDragValue: InternalColumn | InternalProvidedColumnGroup | null,
                    lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null
                ) => this.moveItem(currentDragValue, lastHoveredListItem),
            })
        );
    }

    private getCurrentDragValue(
        listItemDragStartEvent: ColumnPanelItemDragStartEvent
    ): InternalColumn | InternalProvidedColumnGroup {
        return listItemDragStartEvent.column as InternalColumn | InternalProvidedColumnGroup;
    }

    private isMoveBlocked(currentDragValue: InternalColumn | InternalProvidedColumnGroup | null): boolean {
        const preventMoving = this.gos.get('suppressMovableColumns');
        if (preventMoving) {
            return true;
        }

        const currentColumns = this.getCurrentColumns(currentDragValue);
        const hasNotMovable = currentColumns.find((col) => {
            const colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });

        return !!hasNotMovable;
    }

    private moveItem(
        currentDragValue: InternalColumn | InternalProvidedColumnGroup | null,
        lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null
    ): void {
        const targetIndex: number | null = this.getTargetIndex(currentDragValue, lastHoveredListItem);

        const columnsToMove: InternalColumn[] = this.getCurrentColumns(currentDragValue);

        if (targetIndex != null) {
            this.columnMoveService.moveColumns(columnsToMove, targetIndex, 'toolPanelUi');
        }
    }

    private getMoveDiff(currentDragValue: InternalColumn | InternalProvidedColumnGroup | null, end: number): number {
        const allColumns = this.columnModel.getCols();
        const currentColumns = this.getCurrentColumns(currentDragValue);
        const currentColumn = currentColumns[0];
        const span = currentColumns.length;

        const currentIndex = allColumns.indexOf(currentColumn as InternalColumn);

        if (currentIndex < end) {
            return span;
        }

        return 0;
    }

    private getCurrentColumns(currentDragValue: InternalColumn | InternalProvidedColumnGroup | null): InternalColumn[] {
        if (isProvidedColumnGroup(currentDragValue)) {
            return currentDragValue.getLeafColumns();
        }
        return [currentDragValue!];
    }

    private getTargetIndex(
        currentDragValue: InternalColumn | InternalProvidedColumnGroup | null,
        lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null
    ): number | null {
        if (!lastHoveredListItem) {
            return null;
        }
        const columnItemComponent = lastHoveredListItem.component;
        let isBefore = lastHoveredListItem.position === 'top';

        let targetColumn: InternalColumn;

        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            const columns = columnItemComponent.getColumns();
            targetColumn = columns[0];
            isBefore = true;
        } else {
            targetColumn = columnItemComponent.getColumn();
        }

        // if the target col is in the cols to be moved, no index to move.
        const movingCols = this.getCurrentColumns(currentDragValue);
        if (movingCols.indexOf(targetColumn) !== -1) {
            return null;
        }

        const targetColumnIndex = this.columnModel.getCols().indexOf(targetColumn as InternalColumn);
        const adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        const diff = this.getMoveDiff(currentDragValue, adjustedTarget);

        return adjustedTarget - diff;
    }
}
