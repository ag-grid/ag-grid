import type { ColDef, Environment } from 'ag-grid-community';

/**
 * Width of the row drag, checkbox and drag source controls drawn before a cell's renderer. Reserves space for the
 * maximum number of widgets that can appear in the column, not the actual number in this cell (e.g. if rowDrag is a
 * callback that returns false), so that content lines up vertically across rows.
 */
export function getCellWidgetsWidth(
    env: Environment,
    widgets: Pick<ColDef, 'rowDrag' | 'checkboxSelection' | 'dndSource'> | undefined
): number {
    const count = (widgets?.rowDrag ? 1 : 0) + (widgets?.checkboxSelection ? 1 : 0) + (widgets?.dndSource ? 1 : 0);
    return count * (env.getDefaultIconSize() + env.getDefaultCellWidgetSpacing());
}
