import type { AgColumn, GridOptionsService, IColsService } from 'ag-grid-community';

export function isRowGroupColLocked(
    gos: GridOptionsService,
    column: AgColumn,
    rowGroupColsService?: IColsService
): boolean {
    const groupLockGroupColumns = gos.get('groupLockGroupColumns');
    if (!column.isRowGroupActive() || groupLockGroupColumns === 0) {
        return false;
    }

    if (groupLockGroupColumns === -1) {
        return true;
    }

    const rowGroupCols = rowGroupColsService?.columns ?? [];
    const colIndex = rowGroupCols.findIndex((groupCol) => groupCol.getColId() === column.getColId());
    return groupLockGroupColumns > colIndex;
}
