function formatTestId(name: string, attributes: Record<string, string | number | null | undefined> = {}): string {
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
export function getTestIdForHeaderFilterButton(colId: string | null): string {
    return formatTestId('ag-header-cell-filter-button', { colId });
}
export function getTestIdForFloatingFilterButton(colId: string | null): string {
    return formatTestId('ag-floating-filter-button', { colId });
}
export function getTestIdForHeaderCellMenuButton(colId: string | null): string {
    return formatTestId('ag-header-cell-menu-button', { ['col-id']: colId });
}

/** Column Filters */

export function getTestIdForColumnFilterPickerDisplay(): string {
    return formatTestId('ag-column-filter-picker-display');
}
export function getTestIdForColumnNumberFilterInput(): string {
    return formatTestId('ag-column-number-filter-number-input');
}
export function getTestIdForColumnTextFilterInput(): string {
    return formatTestId('ag-column-number-filter-text-input');
}
export function getTestIdForColumnDateFilterInput(): string {
    return formatTestId('ag-column-number-filter-date-input');
}
export function getTestIdForSetFilterMiniFilterInput(): string {
    return formatTestId('ag-column-set-filter-mini-filter-input');
}
export function getTestIdForSetFilterItem(label?: string | null): string {
    return formatTestId('ag-column-set-filter-item', { label });
}
export function getTestIdForSetFilterApplyPanelButton(label?: string | null): string {
    return formatTestId('ag-column-set-filter-apply-panel-button', { label });
}
export function getTestIdForFilterConditionRadioButton(label?: string | null): string {
    return formatTestId('ag-column-filter-condition-radio-button', { label });
}

/** Advanced Filter */
export function getTestIdForAdvancedFilterInput(): string {
    return formatTestId('ag-advanced-filter-input');
}
export function getTestIdForAdvancedFilterButton(label?: string | null): string {
    return formatTestId('ag-advanced-filter-button', { label });
}
export function getTestIdForAdvancedFilterBuilderButton(): string {
    return formatTestId('ag-advanced-filter-builder-button');
}
export function getTestIdForAdvancedFilterPanelMaximiseButton(): string {
    return formatTestId('ag-advanced-filter-builder-panel-maximise');
}
export function getTestIdForAdvancedFilterPanelCloseButton(): string {
    return formatTestId('ag-advanced-filter-builder-panel-close');
}
export function getTestIdForAdvancedFilterPill(label?: string | null): string {
    return formatTestId('ag-advanced-filter-builder-pill', { label });
}
export function getTestIdForAdvancedFilterBuilderAddItemButton(): string {
    return formatTestId('ag-advanced-filter-builder-add-item-button');
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

/** Filter Tool Panel */

export function getTestIdForFilterToolPanel(): string {
    return formatTestId('ag-filter-panel');
}
export function getTestIdForFilterToolPanelAddFilterButton(): string {
    return formatTestId('ag-filter-panel-add-filter-button');
}
export function getTestIdForFilterToolPanelFilterTypeSelector(colLabel?: string | null): string {
    return formatTestId('ag-filter-panel-filter-type-selector', { colLabel });
}

/** Status Bar */

export function getTestIdForStatusBarTotalAndFilteredRowCount(): string {
    return formatTestId('ag-status-bar-total-and-filtered-row-count');
}
export function getTestIdForStatusBarTotalRowCount(): string {
    return formatTestId('ag-status-bar-total-row-count');
}
export function getTestIdForStatusBarFilteredRowCount(): string {
    return formatTestId('ag-status-bar-filtered-row-count');
}
export function getTestIdForStatusBarSelectedRowCount(): string {
    return formatTestId('ag-status-bar-selected-row-count');
}
export function getTestIdForStatusBarAggregations(): string {
    return formatTestId('ag-status-bar-aggregations');
}

/** Pagination */

export function getTestIdForPaginationPanelSizePickerDisplay(value?: string | null): string {
    return formatTestId('ag-pagination-page-size-picker-field-display', { value });
}
export function getTestIdForPaginationPanelFirstRowOnPage(value?: string | null): string {
    return formatTestId('ag-paging-row-summary-panel-first-row-on-page', { value });
}
export function getTestIdForPaginationPanelLastRowOnPage(value?: string | null): string {
    return formatTestId('ag-paging-row-summary-panel-last-row-on-page', { value });
}
export function getTestIdForPaginationPanelRecordCount(value?: string | null): string {
    return formatTestId('ag-paging-row-summary-panel-record-count', { value });
}
export function getTestIdForPaginationSummaryPanelButton(label?: string | null): string {
    return formatTestId('ag-paging-page-summary-panel-btn', { label });
}
export function getTestIdForPaginationSummaryPanelCurrentPage(value?: string | null): string {
    return formatTestId('ag-paging-page-summary-panel-current-page', { value });
}
export function getTestIdForPaginationSummaryPanelTotalPage(value?: string | null): string {
    return formatTestId('ag-paging-page-summary-panel-total-page', { value });
}
