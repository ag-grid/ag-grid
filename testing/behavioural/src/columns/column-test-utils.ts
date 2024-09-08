import type { ColDef, ColGroupDef, Column, GridApi, RowGroupingDisplayType } from '@ag-grid-community/core';

export const GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';

/**
 * ignores row group index, examples testing row group index should hard code.
 */
export function getAutoGroupColumnIds(
    colDefs: (ColDef | ColGroupDef)[],
    groupDisplayType: RowGroupingDisplayType,
    pivotMode?: boolean
): string[] {
    switch (groupDisplayType) {
        case 'groupRows':
            if (!pivotMode) {
                return [];
            }
            break;

        case 'multipleColumns': {
            const result: string[] = [];
            colDefs.forEach((colDef) => {
                if ('children' in colDef) {
                    const children = (colDef as ColGroupDef).children;
                    result.concat(getAutoGroupColumnIds(children, groupDisplayType, pivotMode));
                } else if (colDef.rowGroup) {
                    result.push(`${GROUP_AUTO_COLUMN_ID}-${colDef.colId}`);
                }
            });
            return result;
        }
    }
    return [GROUP_AUTO_COLUMN_ID];
}

export function getColumnOrderFromState(gridApi: GridApi) {
    return gridApi.getColumnState().map((colState) => colState.colId);
}

export function getColumnOrder(gridApi: GridApi, viewport: 'all' | 'left' | 'center' | 'right') {
    let columns: Column[];
    switch (viewport) {
        case 'all':
            columns = gridApi.getAllDisplayedColumns();
            break;
        case 'left':
            columns = gridApi.getDisplayedLeftColumns();
            break;
        case 'right':
            columns = gridApi.getDisplayedRightColumns();
            break;
        case 'center':
            columns = gridApi.getDisplayedCenterColumns();
    }
    return columns.map((col) => col.getColId());
}
