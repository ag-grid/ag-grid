function formatTestId(name: string, attributes: Record<string, string | number | null | undefined> = {}): string {
    const params = Object.entries(attributes)
        .map(([k, v]) => (v != null ? `${k}=${v}` : null))
        .filter(Boolean)
        .join(';');
    return [name, params].filter((s) => s.length > 0).join(':');
}

/** Headers */

export function headerGroupCell(colId: string | null): string {
    return formatTestId('ag-header-group-cell', { ['col-id']: colId });
}
export function headerCell(colId: string | null): string {
    return formatTestId('ag-header-cell', { ['col-id']: colId });
}
export function headerCheckbox(colId: string | null): string {
    return formatTestId('ag-header-selection-checkbox', { ['col-id']: colId });
}
export function headerFilterButton(colId: string | null): string {
    return formatTestId('ag-header-cell-filter-button', { colId });
}
export function floatingFilterButton(colId: string | null): string {
    return formatTestId('ag-floating-filter-button', { colId });
}
export function headerCellMenuButton(colId: string | null): string {
    return formatTestId('ag-header-cell-menu-button', { ['col-id']: colId });
}

/** Column Filters */

export function columnFilterPickerDisplay(): string {
    return formatTestId('ag-column-filter-picker-display');
}
export function columnNumberFilterInput(): string {
    return formatTestId('ag-column-number-filter-number-input');
}
export function columnTextFilterInput(): string {
    return formatTestId('ag-column-number-filter-text-input');
}
export function columnDateFilterInput(): string {
    return formatTestId('ag-column-number-filter-date-input');
}
export function setFilterMiniFilterInput(): string {
    return formatTestId('ag-column-set-filter-mini-filter-input');
}
export function setFilterItem(label?: string | null): string {
    return formatTestId('ag-column-set-filter-item', { label });
}
export function setFilterApplyPanelButton(label?: string | null): string {
    return formatTestId('ag-column-set-filter-apply-panel-button', { label });
}
export function filterConditionRadioButton(label?: string | null): string {
    return formatTestId('ag-column-filter-condition-radio-button', { label });
}

/** Advanced Filter */
export function advancedFilterInput(): string {
    return formatTestId('ag-advanced-filter-input');
}
export function advancedFilterButton(label?: string | null): string {
    return formatTestId('ag-advanced-filter-button', { label });
}
export function advancedFilterBuilderButton(): string {
    return formatTestId('ag-advanced-filter-builder-button');
}
export function advancedFilterPanelMaximiseButton(): string {
    return formatTestId('ag-advanced-filter-builder-panel-maximise');
}
export function advancedFilterPanelCloseButton(): string {
    return formatTestId('ag-advanced-filter-builder-panel-close');
}
export function advancedFilterPill(label?: string | null): string {
    return formatTestId('ag-advanced-filter-builder-pill', { label });
}
export function advancedFilterBuilderAddItemButton(): string {
    return formatTestId('ag-advanced-filter-builder-add-item-button');
}

/** Rows */

export function rowNode(rowId: string | null): string {
    return formatTestId('ag-row', { ['row-id']: rowId });
}

/** Cells */

export function cell(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-cell', { ['row-id']: rowId, ['col-id']: colId });
}
export function checkbox(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-selection-checkbox', { ['row-id']: rowId, ['col-id']: colId });
}
export function dragHandle(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-drag-handle', { ['row-id']: rowId, ['col-id']: colId });
}
export function groupContracted(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-group-contracted', { ['row-id']: rowId, ['col-id']: colId });
}
export function groupExpanded(rowId: string | null, colId: string | null): string {
    return formatTestId('ag-group-expanded', { ['row-id']: rowId, ['col-id']: colId });
}

/** Menu */

export function menu(): string {
    return formatTestId('ag-menu');
}
export function menuOption(option?: string | null): string {
    return formatTestId('ag-menu-option', { ['option']: option });
}

/** SideBar */

export function sideBar(): string {
    return formatTestId('ag-side-bar');
}
export function sideBarButton(label?: string | null): string {
    return formatTestId('ag-side-button', { label });
}

/** Column Tool Panel */

export function columnToolPanel(): string {
    return formatTestId('ag-column-panel');
}
export function pivotModeSelect(): string {
    return formatTestId('ag-pivot-mode-select');
}
export function columnPanelSelectHeaderCheckbox(): string {
    return formatTestId('ag-column-panel-select-header-checkbox');
}
export function columnPanelSelectHeaderFilter(): string {
    return formatTestId('ag-column-panel-select-header-filter');
}
export function columnSelectListItemGroupClosedIcon(label?: string | null): string {
    return formatTestId('ag-column-select-list-item-group-closed-icon', { label });
}
export function columnSelectListItemCheckbox(label?: string | null): string {
    return formatTestId('ag-column-select-list-item-checkbox', { label });
}
export function columnSelectListItemDragHandle(label?: string | null): string {
    return formatTestId('ag-column-select-list-item-drag-handle', { label });
}
export function columnDropCellDragHandle(label?: string | null): string {
    return formatTestId('ag-column-drop-cell-drag-handle', { label });
}

/** Filter Tool Panel */

export function filterToolPanel(): string {
    return formatTestId('ag-filter-panel');
}
export function filterToolPanelAddFilterButton(): string {
    return formatTestId('ag-filter-panel-add-filter-button');
}
export function filterToolPanelFilterTypeSelector(colLabel?: string | null): string {
    return formatTestId('ag-filter-panel-filter-type-selector', { colLabel });
}

/** Status Bar */

export function statusBarTotalAndFilteredRowCount(): string {
    return formatTestId('ag-status-bar-total-and-filtered-row-count');
}
export function statusBarTotalRowCount(): string {
    return formatTestId('ag-status-bar-total-row-count');
}
export function statusBarFilteredRowCount(): string {
    return formatTestId('ag-status-bar-filtered-row-count');
}
export function statusBarSelectedRowCount(): string {
    return formatTestId('ag-status-bar-selected-row-count');
}
export function statusBarAggregations(): string {
    return formatTestId('ag-status-bar-aggregations');
}

/** Pagination */

export function paginationPanelSizePickerDisplay(value?: string | null): string {
    return formatTestId('ag-pagination-page-size-picker-field-display', { value });
}
export function paginationPanelFirstRowOnPage(value?: string | null): string {
    return formatTestId('ag-paging-row-summary-panel-first-row-on-page', { value });
}
export function paginationPanelLastRowOnPage(value?: string | null): string {
    return formatTestId('ag-paging-row-summary-panel-last-row-on-page', { value });
}
export function paginationPanelRecordCount(value?: string | null): string {
    return formatTestId('ag-paging-row-summary-panel-record-count', { value });
}
export function paginationSummaryPanelButton(label?: string | null): string {
    return formatTestId('ag-paging-page-summary-panel-btn', { label });
}
export function paginationSummaryPanelCurrentPage(value?: string | null): string {
    return formatTestId('ag-paging-page-summary-panel-current-page', { value });
}
export function paginationSummaryPanelTotalPage(value?: string | null): string {
    return formatTestId('ag-paging-page-summary-panel-total-page', { value });
}
