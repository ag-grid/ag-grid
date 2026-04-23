import type {
    AgColumn,
    AgProvidedColumnGroup,
    BeanCollection,
    ColumnPanelItemDragStartEvent,
    GridOptionsService,
} from 'ag-grid-community';
import { isProvidedColumnGroup } from 'ag-grid-community';

import type { VirtualListDragItem } from '../agStack/iVirtualListDragFeature';
import type { ToolPanelColumnComp } from './toolPanelColumnComp';
import { ToolPanelColumnGroupComp } from './toolPanelColumnGroupComp';
import { isDeferredMode, refreshDeferredToolPanelUi } from './toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from './updates/columnStateUpdateTypes';

export const getCurrentColumnsBeingMoved = (column: AgColumn | AgProvidedColumnGroup | null): AgColumn[] => {
    if (isProvidedColumnGroup(column)) {
        return column.getLeafColumns();
    }
    return column ? [column] : [];
};

const getMoveTargetIndex = (
    currentColumns: AgColumn[] | null,
    lastHoveredColumn: AgColumn,
    isBefore: boolean,
    allColumns: AgColumn[]
): number | null => {
    if (!lastHoveredColumn || !currentColumns) {
        return null;
    }

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

export const isMoveBlocked = (
    gos: GridOptionsService,
    beans: BeanCollection,
    currentColumns: AgColumn[],
    params: ColumnStateUpdateParams
): boolean => {
    const deferMode = isDeferredMode(params);
    const preventMoving = gos.get('suppressMovableColumns') || beans.columnStateUpdateStrategy.getPivotMode(deferMode);

    if (preventMoving) {
        return true;
    }

    const hasNotMovable = currentColumns.find(({ colDef }) => !!colDef.suppressMovable || !!colDef.lockPosition);

    return !!hasNotMovable;
};

export const moveItem = (
    beans: BeanCollection,
    currentColumns: AgColumn[],
    lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null,
    params: ColumnStateUpdateParams
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

    const deferMode = isDeferredMode(params);
    const allColumns = deferMode
        ? beans.columnStateUpdateStrategy.getPrimaryColumns(deferMode)
        : beans.colModel.getCols();
    const targetIndex: number | null = getMoveTargetIndex(currentColumns, lastHoveredColumn, isBefore, allColumns);

    if (targetIndex != null) {
        beans.columnStateUpdateStrategy.moveColumns(deferMode, currentColumns, targetIndex, 'toolPanelUi');
        refreshDeferredToolPanelUi(beans, params);
    }
};

export const getCurrentDragValue = (
    listItemDragStartEvent: ColumnPanelItemDragStartEvent
): AgColumn | AgProvidedColumnGroup => {
    return listItemDragStartEvent.column as AgColumn | AgProvidedColumnGroup;
};
