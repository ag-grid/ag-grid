function formatTestId(name: string, attributes: Record<string, string | number | null | undefined> = {}): string {
    const params = Object.entries(attributes)
        .map(([k, v]) => (v != null ? `${k}=${v}` : null))
        .filter(Boolean)
        .join(';');
    return [name, params].filter((s) => s.length > 0).join(':');
}

export const agTestIdFor = {
    /** Headers */

    headerGroupCell(colId: string | null): string {
        return formatTestId('ag-header-group-cell', { ['col-id']: colId });
    },
    headerCell(colId: string | null): string {
        return formatTestId('ag-header-cell', { ['col-id']: colId });
    },
    headerCheckbox(colId: string | null): string {
        return formatTestId('ag-header-selection-checkbox', { ['col-id']: colId });
    },
    headerFilterButton(colId: string | null): string {
        return formatTestId('ag-header-cell-filter-button', { colId });
    },
    floatingFilterButton(colId: string | null): string {
        return formatTestId('ag-floating-filter-button', { colId });
    },
    headerCellMenuButton(colId: string | null): string {
        return formatTestId('ag-header-cell-menu-button', { ['col-id']: colId });
    },

    /** Column Filters */

    columnFilterPickerDisplay(): string {
        return formatTestId('ag-column-filter-picker-display');
    },
    columnNumberFilterInput(): string {
        return formatTestId('ag-column-number-filter-number-input');
    },
    columnTextFilterInput(): string {
        return formatTestId('ag-column-number-filter-text-input');
    },
    columnDateFilterInput(): string {
        return formatTestId('ag-column-number-filter-date-input');
    },
    setFilterMiniFilterInput(): string {
        return formatTestId('ag-column-set-filter-mini-filter-input');
    },
    setFilterItem(label?: string | null): string {
        return formatTestId('ag-column-set-filter-item', { label });
    },
    setFilterApplyPanelButton(label?: string | null): string {
        return formatTestId('ag-column-set-filter-apply-panel-button', { label });
    },
    filterConditionRadioButton(label?: string | null): string {
        return formatTestId('ag-column-filter-condition-radio-button', { label });
    },

    /** Advanced Filter */
    advancedFilterInput(): string {
        return formatTestId('ag-advanced-filter-input');
    },
    advancedFilterButton(label?: string | null): string {
        return formatTestId('ag-advanced-filter-button', { label });
    },
    advancedFilterBuilderButton(): string {
        return formatTestId('ag-advanced-filter-builder-button');
    },
    advancedFilterPanelMaximiseButton(): string {
        return formatTestId('ag-advanced-filter-builder-panel-maximise');
    },
    advancedFilterPanelCloseButton(): string {
        return formatTestId('ag-advanced-filter-builder-panel-close');
    },
    advancedFilterPill(label?: string | null): string {
        return formatTestId('ag-advanced-filter-builder-pill', { label });
    },
    advancedFilterBuilderAddItemButton(): string {
        return formatTestId('ag-advanced-filter-builder-add-item-button');
    },

    /** Rows */

    rowNode(rowId: string | null): string {
        return formatTestId('ag-row', { ['row-id']: rowId });
    },

    /** Cells */

    cell(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-cell', { ['row-id']: rowId, ['col-id']: colId });
    },
    checkbox(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-selection-checkbox', { ['row-id']: rowId, ['col-id']: colId });
    },
    dragHandle(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-drag-handle', { ['row-id']: rowId, ['col-id']: colId });
    },
    groupContracted(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-group-contracted', { ['row-id']: rowId, ['col-id']: colId });
    },
    groupExpanded(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-group-expanded', { ['row-id']: rowId, ['col-id']: colId });
    },

    /** Menu */

    menu(): string {
        return formatTestId('ag-menu');
    },
    menuOption(option?: string | null): string {
        return formatTestId('ag-menu-option', { ['option']: option });
    },

    /** SideBar */

    sideBar(): string {
        return formatTestId('ag-side-bar');
    },
    sideBarButton(label?: string | null): string {
        return formatTestId('ag-side-button', { label });
    },

    /** Column Tool Panel */

    columnToolPanel(): string {
        return formatTestId('ag-column-panel');
    },
    pivotModeSelect(): string {
        return formatTestId('ag-pivot-mode-select');
    },
    columnPanelSelectHeaderCheckbox(): string {
        return formatTestId('ag-column-panel-select-header-checkbox');
    },
    columnPanelSelectHeaderFilter(): string {
        return formatTestId('ag-column-panel-select-header-filter');
    },
    columnSelectListItemGroupClosedIcon(label?: string | null): string {
        return formatTestId('ag-column-select-list-item-group-closed-icon', { label });
    },
    columnSelectListItemCheckbox(label?: string | null): string {
        return formatTestId('ag-column-select-list-item-checkbox', { label });
    },
    columnSelectListItemDragHandle(label?: string | null): string {
        return formatTestId('ag-column-select-list-item-drag-handle', { label });
    },
    columnDropCellDragHandle(label?: string | null): string {
        return formatTestId('ag-column-drop-cell-drag-handle', { label });
    },

    /** Filter Tool Panel */

    filterToolPanel(): string {
        return formatTestId('ag-filter-panel');
    },
    filterToolPanelAddFilterButton(): string {
        return formatTestId('ag-filter-panel-add-filter-button');
    },
    filterToolPanelFilterTypeSelector(colLabel?: string | null): string {
        return formatTestId('ag-filter-panel-filter-type-selector', { colLabel });
    },

    /** Status Bar */

    statusBarTotalAndFilteredRowCount(): string {
        return formatTestId('ag-status-bar-total-and-filtered-row-count');
    },
    statusBarTotalRowCount(): string {
        return formatTestId('ag-status-bar-total-row-count');
    },
    statusBarFilteredRowCount(): string {
        return formatTestId('ag-status-bar-filtered-row-count');
    },
    statusBarSelectedRowCount(): string {
        return formatTestId('ag-status-bar-selected-row-count');
    },
    statusBarAggregations(): string {
        return formatTestId('ag-status-bar-aggregations');
    },

    /** Pagination */

    paginationPanelSizePickerDisplay(value?: string | null): string {
        return formatTestId('ag-pagination-page-size-picker-field-display', { value });
    },
    paginationPanelFirstRowOnPage(value?: string | null): string {
        return formatTestId('ag-paging-row-summary-panel-first-row-on-page', { value });
    },
    paginationPanelLastRowOnPage(value?: string | null): string {
        return formatTestId('ag-paging-row-summary-panel-last-row-on-page', { value });
    },
    paginationPanelRecordCount(value?: string | null): string {
        return formatTestId('ag-paging-row-summary-panel-record-count', { value });
    },
    paginationSummaryPanelButton(label?: string | null): string {
        return formatTestId('ag-paging-page-summary-panel-btn', { label });
    },
    paginationSummaryPanelCurrentPage(value?: string | null): string {
        return formatTestId('ag-paging-page-summary-panel-current-page', { value });
    },
    paginationSummaryPanelTotalPage(value?: string | null): string {
        return formatTestId('ag-paging-page-summary-panel-total-page', { value });
    },
};
