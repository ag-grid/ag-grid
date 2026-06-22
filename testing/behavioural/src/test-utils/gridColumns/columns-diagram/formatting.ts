import type { AgColumn, Column, ColumnGroup, GridApi } from 'ag-grid-community';

/**
 * Formats a leaf column for the diagram.
 * Format: `colId "HeaderName" [properties...]`
 * HeaderName is omitted when it equals colId.
 *
 * Properties shown (when non-default):
 *   width:N, flex:N,
 *   sort:asc|desc, sortIndex:N,
 *   rowGroup, rowGroupIndex:N, pivot, pivotIndex:N, aggFunc:name, ƒ (calculated column),
 *   %:mode (showValuesAs), filter, columnGroupShow:open|closed, hidden, !visible,
 *   editable, !resizable, !sortable, suppressMovable, lockPosition:left|right
 *
 * `hidden` means not in the displayed set — visibility off or a child of a collapsed group.
 * `!visible` reflects the grid-state visibility flag (`col.isVisible()`), shown independently of `hidden`.
 */
export function columnDiagram(col: Column, api: GridApi, isHidden: boolean): string {
    const colId = col.getColId();
    const headerName = api.getDisplayNameForColumn(col, 'header') ?? '';
    const parts: string[] = [colId];

    // Show header name if different from colId
    if (headerName && headerName !== colId) {
        parts.push(JSON.stringify(headerName));
    }

    // Width — always show
    parts.push('width:' + col.getActualWidth());

    // Flex
    const flex = col.getFlex();
    if (flex != null && flex > 0) {
        parts.push('flex:' + flex);
    }

    // Sort
    const sort = col.getSort();
    if (sort) {
        parts.push('sort:' + sort);
        const sortIndex = col.getSortIndex();
        if (sortIndex != null && sortIndex >= 0) {
            parts.push('sortIndex:' + sortIndex);
        }
    }

    // Row group
    if (col.isRowGroupActive()) {
        parts.push('rowGroup');
        const colDef = col.getColDef();
        if (colDef.rowGroupIndex != null && colDef.rowGroupIndex >= 0) {
            parts.push('rowGroupIndex:' + colDef.rowGroupIndex);
        }
    }

    // Pivot
    if (col.isPivotActive()) {
        parts.push('pivot');
        const colDef = col.getColDef();
        if (colDef.pivotIndex != null && colDef.pivotIndex >= 0) {
            parts.push('pivotIndex:' + colDef.pivotIndex);
        }
    }

    const aggFunc = col.isValueActive() ? col.getAggFunc() : null;
    if (aggFunc != null) {
        parts.push('aggFunc:' + (typeof aggFunc === 'string' ? aggFunc : 'custom'));
    }

    // Calculated column (formula-derived, read-only)
    if ((col as AgColumn).isCalculatedCol) {
        parts.push('ƒ');
    }

    // Show Values As mode (the active selector)
    const showValuesAs = (col as AgColumn).showValuesAs;
    if (showValuesAs != null) {
        parts.push('%:' + showValuesAs.type);
    }

    // Filter active
    if (col.isFilterActive()) {
        parts.push('filter');
    }

    // columnGroupShow
    const columnGroupShow = col.getColumnGroupShow();
    if (columnGroupShow) {
        parts.push('columnGroupShow:' + columnGroupShow);
    }

    // Hidden: not in the displayed set (visibility off or child of a collapsed group).
    if (isHidden) {
        parts.push('hidden');
    }

    // Grid-state visibility flag, shown independently of why the column is not displayed.
    if (!col.isVisible()) {
        parts.push('!visible');
    }

    const colDef = col.getColDef();

    // Editable
    if (colDef.editable === true) {
        parts.push('editable');
    }

    // Row spanning (CellSpanModule)
    if (colDef.spanRows) {
        parts.push(typeof colDef.spanRows === 'function' ? 'spanRows:fn' : 'spanRows');
    }

    // Not resizable (show only when explicitly disabled — default is true)
    if (colDef.resizable === false) {
        parts.push('!resizable');
    }

    // Not sortable (show only when explicitly disabled)
    if (colDef.sortable === false) {
        parts.push('!sortable');
    }

    // Suppress movable
    if (colDef.suppressMovable === true) {
        parts.push('suppressMovable');
    }

    // Lock position
    if (colDef.lockPosition === 'left') {
        parts.push('lockPosition:left');
    } else if (colDef.lockPosition === 'right') {
        parts.push('lockPosition:right');
    } else if (colDef.lockPosition === true) {
        parts.push('lockPosition');
    }

    return parts.join(' ');
}

/**
 * Formats a column group for the diagram.
 * Format: `"HeaderName" GROUP [open|closed] [marryChildren]`
 */
export function columnGroupDiagram(group: ColumnGroup, api: GridApi): string {
    const headerName = api.getDisplayNameForColumnGroup(group, 'header') ?? '';
    const parts: string[] = [];

    if (headerName) {
        parts.push(JSON.stringify(headerName));
    }

    parts.push('GROUP');

    if (group.isPadding()) {
        parts.push('padding');
    } else if (group.isExpandable()) {
        parts.push(group.isExpanded() ? 'open' : 'closed');
    }

    // Show marryChildren flag
    const colGroupDef = group.getColGroupDef();
    if (colGroupDef?.marryChildren) {
        parts.push('marryChildren');
    }

    return parts.join(' ');
}
