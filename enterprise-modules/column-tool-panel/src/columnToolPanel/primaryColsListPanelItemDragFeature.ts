import type {
    AgColumn,
    AgProvidedColumnGroup,
    BeanCollection,
    ColumnMoveService,
    ColumnPanelItemDragStartEvent,
} from '@ag-grid-community/core';
import { BeanStub, DragSourceType, isProvidedColumnGroup } from '@ag-grid-community/core';
import { VirtualListDragFeature } from '@ag-grid-enterprise/core';
import type { VirtualList, VirtualListDragItem } from '@ag-grid-enterprise/core';

import type { AgPrimaryColsList } from './agPrimaryColsList';
import type { ToolPanelColumnComp } from './toolPanelColumnComp';
import { ToolPanelColumnGroupComp } from './toolPanelColumnGroupComp';

export class PrimaryColsListPanelItemDragFeature extends BeanStub {
    private columnMoveService: ColumnMoveService;

    public wireBeans(beans: BeanCollection) {
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
                AgColumn | AgProvidedColumnGroup,
                ColumnPanelItemDragStartEvent
            >(this.comp, this.virtualList, {
                dragSourceType: DragSourceType.ToolPanel,
                listItemDragStartEvent: 'columnPanelItemDragStart',
                listItemDragEndEvent: 'columnPanelItemDragEnd',
                eventSource: this.eventService,
                getCurrentDragValue: (listItemDragStartEvent: ColumnPanelItemDragStartEvent) =>
                    this.getCurrentDragValue(listItemDragStartEvent),
                isMoveBlocked: (currentDragValue: AgColumn | AgProvidedColumnGroup | null) =>
                    this.isMoveBlocked(currentDragValue),
                getNumRows: (comp: AgPrimaryColsList) => comp.getDisplayedColsList().length,
                moveItem: (
                    currentDragValue: AgColumn | AgProvidedColumnGroup | null,
                    lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null
                ) => this.moveItem(this.getCurrentColumnsBeingMoved(currentDragValue), lastHoveredListItem),
            })
        );
    }

    private getCurrentDragValue(
        listItemDragStartEvent: ColumnPanelItemDragStartEvent
    ): AgColumn | AgProvidedColumnGroup {
        return listItemDragStartEvent.column as AgColumn | AgProvidedColumnGroup;
    }

    private getCurrentColumnsBeingMoved(column: AgColumn | AgProvidedColumnGroup | null): AgColumn[] {
        if (isProvidedColumnGroup(column)) {
            return column.getLeafColumns();
        }
        return column ? [column] : [];
    }

    private isMoveBlocked(currentDragValue: AgColumn | AgProvidedColumnGroup | null): boolean {
        const preventMoving = this.gos.get('suppressMovableColumns');
        if (preventMoving) {
            return true;
        }

        const currentColumns = this.getCurrentColumnsBeingMoved(currentDragValue);
        const hasNotMovable = currentColumns.find((col) => {
            const colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });

        return !!hasNotMovable;
    }

    private moveItem(
        currentColumns: AgColumn[],
        lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null
    ): void {
        if (!lastHoveredListItem) {
            return;
        }

        const { columnMoveService } = this;
        const { component } = lastHoveredListItem;

        let lastHoveredColumn: AgColumn | null = null;
        let isBefore = lastHoveredListItem.position === 'top';

        if (component instanceof ToolPanelColumnGroupComp) {
            const columns = component.getColumns();
            lastHoveredColumn = columns[0];
            isBefore = true;
        } else if (component) {
            lastHoveredColumn = component.getColumn();
        }

        if (!lastHoveredColumn) {
            return;
        }

        const targetIndex: number | null = columnMoveService.getMoveTargetIndex(
            currentColumns,
            lastHoveredColumn,
            isBefore
        );

        if (targetIndex != null) {
            this.columnMoveService.moveColumns(currentColumns, targetIndex, 'toolPanelUi');
        }
    }
}
