export function formatTestId(
    name: string,
    attributes: Record<string, string | number | null | undefined> = {}
): string {
    const params = Object.entries(attributes)
        .map(([k, v]) => (v != null ? `${k}=${v}` : null))
        .filter(Boolean)
        .join(';');
    return [name, params].filter((s) => s.length > 0).join(':');
}

/** Headers */

export function getTestIdForHeaderGroupCell(colId: string | null): string {
    return formatTestId('ag-header-group-cell', { ['col-id']: colId });
}
export function getTestIdForHeaderCell(colId: string | null): string {
    return formatTestId('ag-header-cell', { ['col-id']: colId });
}
export function getTestIdForHeaderCheckbox(colId: string | null): string {
    return formatTestId('ag-header-selection-checkbox', { ['col-id']: colId });
}
export function getTestIdForHeaderCellMenuButton(colId: string | null): string {
    return formatTestId('ag-header-cell-menu-button', { ['col-id']: colId });
}

/** Rows */

export function getTestIdForRowNode(rowId: string | null): string {
    return formatTestId('ag-row', { ['row-id']: rowId });
}

/** Cells */

export function getTestIdForCell(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-cell', { ['row-id']: rowId, ['col-id']: colId });
}
export function getTestIdForCheckbox(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-selection-checkbox', { ['row-id']: rowId, ['col-id']: colId });
}
export function getTestIdForDragHandle(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-drag-handle', { ['row-id']: rowId, ['col-id']: colId });
}
export function getTestIdForGroupContracted(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-group-contracted', { ['row-id']: rowId, ['col-id']: colId });
}
export function getTestIdForGroupExpanded(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-group-expanded', { ['row-id']: rowId, ['col-id']: colId });
}

/** Menu */

export function getTestIdForMenu(): string {
    return formatTestId('ag-menu');
}
export function getTestIdForMenuOption(option?: string | null): string {
    return formatTestId('ag-menu-option', { ['option']: option });
}

/** SideBar */

export function getTestIdForSideBar(): string {
    return formatTestId('ag-side-bar');
}
export function getTestIdForSideBarButton(label?: string | null): string {
    return formatTestId('ag-side-button', { label });
}

/** Column Tool Panel */

export function getTestIdForColumnToolPanel(): string {
    return formatTestId('ag-column-panel');
}
export function getTestIdForPivotModeSelect(): string {
    return formatTestId('ag-pivot-mode-select');
}
export function getTestIdForColumnPanelSelectHeaderCheckbox(): string {
    return formatTestId('ag-column-panel-select-header-checkbox');
}
export function getTestIdForColumnPanelSelectHeaderFilter(): string {
    return formatTestId('ag-column-panel-select-header-filter');
}
export function getTestIdForColumnSelectListItemGroupClosedIcon(label?: string | null): string {
    return formatTestId('ag-column-select-list-item-group-closed-icon', { label });
}
export function getTestIdForColumnSelectListItemCheckbox(label?: string | null): string {
    return formatTestId('ag-column-select-list-item-checkbox', { label });
}
export function getTestIdForColumnSelectListItemDragHandle(label?: string | null): string {
    return formatTestId('ag-column-select-list-item-drag-handle', { label });
}
export function getTestIdForColumnDropCellDragHandle(label?: string | null): string {
    return formatTestId('ag-column-drop-cell-drag-handle', { label });
}
