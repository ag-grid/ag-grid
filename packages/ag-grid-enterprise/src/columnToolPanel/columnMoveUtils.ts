import type {
    AgColumn,
    AgProvidedColumnGroup,
    BeanCollection,
    ColumnPanelItemDragStartEvent,
    GridOptionsService,
} from 'ag-grid-community';
import { isProvidedColumnGroup } from 'ag-grid-community';

import type { VirtualListDragItem } from '../features/iVirtualListDragFeature';
import type { ToolPanelColumnComp } from './toolPanelColumnComp';
import { ToolPanelColumnGroupComp } from './toolPanelColumnGroupComp';

export const getCurrentColumnsBeingMoved = (column: AgColumn | AgProvidedColumnGroup | null): AgColumn[] => {
    if (isProvidedColumnGroup(column)) {
        return column.getLeafColumns();
    }
    return column ? [column] : [];
};

const getMoveTargetIndex = (
    beans: BeanCollection,
    currentColumns: AgColumn[] | null,
    lastHoveredColumn: AgColumn,
    isBefore: boolean
): number | null => {
    if (!lastHoveredColumn || !currentColumns) {
        return null;
    }

    const allColumns = beans.colModel.getCols();
    const targetColumnIndex = allColumns.indexOf(lastHoveredColumn);
    const adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
    const diff = getMoveDiff(allColumns, currentColumns, adjustedTarget);

    return adjustedTarget - diff;
};

const getMoveDiff = (allColumns: AgColumn[], currentColumns: AgColumn[] | null, end: number): number => {
    if (!currentColumns) {
        return 0;
    }

    const targetColumn = currentColumns[0];
    const span = currentColumns.length;
    const currentIndex = allColumns.indexOf(targetColumn);

    if (currentIndex < end) {
        return span;
    }

    return 0;
};

export const isMoveBlocked = (gos: GridOptionsService, beans: BeanCollection, currentColumns: AgColumn[]): boolean => {
    const preventMoving = gos.get('suppressMovableColumns') || beans.colModel.isPivotMode();

    if (preventMoving) {
        return true;
    }

    const hasNotMovable = currentColumns.find(({ colDef }) => !!colDef.suppressMovable || !!colDef.lockPosition);

    return !!hasNotMovable;
};

export const moveItem = (
    beans: BeanCollection,
    currentColumns: AgColumn[],
    lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null
): void => {
    if (!lastHoveredListItem) {
        return;
    }

    const { component } = lastHoveredListItem;

    let lastHoveredColumn: AgColumn | null = null;
    let isBefore = lastHoveredListItem.position === 'top';

    if (component instanceof ToolPanelColumnGroupComp) {
        const columns = component.getColumns();
        lastHoveredColumn = columns[0];
        isBefore = true;
    } else if (component) {
        lastHoveredColumn = component.column;
    }

    if (!lastHoveredColumn) {
        return;
    }

    const targetIndex: number | null = getMoveTargetIndex(beans, currentColumns, lastHoveredColumn, isBefore);

    if (targetIndex != null) {
        beans.colMoves?.moveColumns(currentColumns, targetIndex, 'toolPanelUi');
    }
};

export const getCurrentDragValue = (
    listItemDragStartEvent: ColumnPanelItemDragStartEvent
): AgColumn | AgProvidedColumnGroup => {
    return listItemDragStartEvent.column as AgColumn | AgProvidedColumnGroup;
};
