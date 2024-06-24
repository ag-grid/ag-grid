import type { BeanCollection } from '../context/context';
import type { CellPosition } from '../entities/cellPositionUtils';
import type { Column, ColumnGroup } from '../interfaces/iColumn';
import type { RowPinnedType } from '../interfaces/iRowNode';

export function getFocusedCell(beans: BeanCollection): CellPosition | null {
    return beans.focusService.getFocusedCell();
}

export function clearFocusedCell(beans: BeanCollection): void {
    return beans.focusService.clearFocusedCell();
}

export function setFocusedCell(
    beans: BeanCollection,
    rowIndex: number,
    colKey: string | Column,
    rowPinned?: RowPinnedType
) {
    beans.focusService.setFocusedCell({ rowIndex, column: colKey, rowPinned, forceBrowserFocus: true });
}

export function tabToNextCell(beans: BeanCollection, event?: KeyboardEvent): boolean {
    return beans.navigationService.tabToNextCell(false, event);
}

export function tabToPreviousCell(beans: BeanCollection, event?: KeyboardEvent): boolean {
    return beans.navigationService.tabToNextCell(true, event);
}

export function setFocusedHeader(
    beans: BeanCollection,
    colKey: string | Column | ColumnGroup,
    floatingFilter: boolean = false
) {
    const headerPosition = beans.headerNavigationService.getHeaderPositionForColumn(colKey, floatingFilter);

    if (!headerPosition) {
        return;
    }

    beans.focusService.focusHeaderPosition({ headerPosition });
}
