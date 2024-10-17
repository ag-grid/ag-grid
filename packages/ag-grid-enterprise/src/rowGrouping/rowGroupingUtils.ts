import type { AgColumn, FuncColsService, GridOptionsService } from 'ag-grid-community';

export function isRowGroupColLocked(
    funcColsService: FuncColsService,
    gos: GridOptionsService,
    column: AgColumn
): boolean {
    const groupLockGroupColumns = gos.get('groupLockGroupColumns');
    if (!column.isRowGroupActive() || groupLockGroupColumns === 0) {
        return false;
    }

    if (groupLockGroupColumns === -1) {
        return true;
    }

    const rowGroupCols = funcColsService.rowGroupCols;
    const colIndex = rowGroupCols.findIndex((groupCol) => groupCol.getColId() === column.getColId());
    return groupLockGroupColumns > colIndex;
}
