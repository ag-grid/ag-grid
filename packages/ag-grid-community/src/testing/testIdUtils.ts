import { GROUP_AUTO_COLUMN_ID, ROW_NUMBERS_COLUMN_ID, SELECTION_COLUMN_ID } from '../columns/columnUtils';

function formatTestId(name: string, attributes: Record<string, string | number | null | undefined> = {}): string {
    const params = Object.keys(attributes)
        .map((k) => {
            const v = attributes[k];
            return v != null ? `${k}=${v}` : null;
        })
        .filter(Boolean)
        .join(';');
    return [name, params].filter((s) => s.length > 0).join(':');
}

export type FilterSpec =
    | {
          source: 'filter-toolpanel';
          colLabel?: string | null;
      }
    | {
          source: 'column-filter';
          colId?: string | null;
      }
    | {
          source: 'floating-filter';
          colId?: string | null;
      };

export const agTestIdFor = {
    grid(gridId: string): string {
        return formatTestId('ag-grid-root', { gridId });
    },

    /** Headers */

    headerGroupCell(colId: string | null): string {
        return formatTestId('ag-header-group-cell', { colId });
    },
    headerCell(colId: string | null): string {
        return formatTestId('ag-header-cell', { colId });
    },
    headerCheckbox(colId: string | null): string {
        return formatTestId('ag-header-selection-checkbox', { colId });
    },
    headerFilterButton(colId: string | null): string {
        return formatTestId('ag-header-cell-filter-button', { colId });
    },
    floatingFilter(colId: string | null): string {
        return formatTestId('ag-floating-filter', { colId });
    },
    floatingFilterButton(colId: string | null): string {
        return formatTestId('ag-floating-filter-button', { colId });
    },
    headerCellMenuButton(colId: string | null): string {
        return formatTestId('ag-header-cell-menu-button', { colId });
    },
    headerResizeHandle(colId?: string | null): string {
        return formatTestId('ag-header-cell-resize', { colId });
    },

    /** Column Filters */

    filterInstancePickerDisplay(spec: FilterSpec): string {
        return formatTestId(
            `ag-${spec.source}-picker-display`,
            spec.source === 'filter-toolpanel' ? { label: spec.colLabel } : { colId: spec.colId }
        );
    },
    numberFilterInstanceInput(spec: FilterSpec): string {
        return formatTestId(
            `ag-${spec.source}-number-input`,
            spec.source === 'filter-toolpanel' ? { label: spec.colLabel } : { colId: spec.colId }
        );
    },
    textFilterInstanceInput(spec: FilterSpec): string {
        return formatTestId(
            `ag-${spec.source}-text-input`,
            spec.source === 'filter-toolpanel' ? { label: spec.colLabel } : { colId: spec.colId }
        );
    },
    dateFilterInstanceInput(spec: FilterSpec): string {
        return formatTestId(
            `ag-${spec.source}-date-input`,
            spec.source === 'filter-toolpanel' ? { label: spec.colLabel } : { colId: spec.colId }
        );
    },
    setFilterInstanceMiniFilterInput(spec: FilterSpec): string {
        return formatTestId(
            `ag-${spec.source}-set-filter-mini-filter-input`,
            spec.source === 'filter-toolpanel' ? { label: spec.colLabel } : { colId: spec.colId }
        );
    },
    setFilterInstanceItem(spec: FilterSpec, itemLabel?: string | null): string {
        return formatTestId(
            `ag-${spec.source}-set-filter-item`,
            spec.source === 'filter-toolpanel'
                ? { colLabel: spec.colLabel, itemLabel }
                : { colId: spec.colId, itemLabel }
        );
    },
    setFilterApplyPanelButton(spec: FilterSpec, buttonLabel?: string | null): string {
        return formatTestId(
            `ag-${spec.source}-set-filter-apply-panel-button`,
            spec.source === 'filter-toolpanel'
                ? { colLabel: spec.colLabel, buttonLabel }
                : { colId: spec.colId, buttonLabel }
        );
    },
    filterConditionRadioButton(spec: FilterSpec, buttonLabel?: string | null): string {
        return formatTestId(
            `ag-${spec.source}-filter-condition-radio-button`,
            spec.source === 'filter-toolpanel'
                ? { colLabel: spec.colLabel, buttonLabel }
                : { colId: spec.colId, buttonLabel }
        );
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
        return formatTestId('ag-cell', { ['row-id']: rowId, colId });
    },
    autoGroupCell(rowId: string | null): string {
        return agTestIdFor.cell(rowId, GROUP_AUTO_COLUMN_ID);
    },
    checkbox(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-selection-checkbox', { ['row-id']: rowId, colId });
    },
    selectionColumnCheckbox(rowId: string | null): string {
        return agTestIdFor.checkbox(rowId, SELECTION_COLUMN_ID);
    },
    autoGroupColumnCheckbox(rowId: string | null): string {
        return agTestIdFor.checkbox(rowId, GROUP_AUTO_COLUMN_ID);
    },
    dragHandle(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-drag-handle', { ['row-id']: rowId, colId });
    },
    groupContracted(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-group-contracted', { ['row-id']: rowId, colId });
    },
    groupExpanded(rowId: string | null, colId: string | null): string {
        return formatTestId('ag-group-expanded', { ['row-id']: rowId, colId });
    },
    autoGroupContracted(rowId: string | null): string {
        return agTestIdFor.groupContracted(rowId, GROUP_AUTO_COLUMN_ID);
    },
    autoGroupExpanded(rowId: string | null): string {
        return agTestIdFor.groupExpanded(rowId, GROUP_AUTO_COLUMN_ID);
    },
    rowNumber(rowId: string | null): string {
        return agTestIdFor.cell(rowId, ROW_NUMBERS_COLUMN_ID);
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
    columnDropCellDragHandle(source: 'panel' | 'toolbar', area?: string | null, label?: string | null): string {
        return formatTestId('ag-column-drop-cell-drag-handle', { source, area, label });
    },
    columnDropCellCancelButton(source: 'panel' | 'toolbar', area?: string | null, label?: string | null): string {
        return formatTestId('ag-column-drop-cell-cancel', { source, area, label });
    },
    columnDropArea(source: 'panel' | 'toolbar', name?: string | null): string {
        return formatTestId('ag-column-drop-area', { source, name });
    },

    /** Filter Tool Panel (New) */

    filterToolPanel(): string {
        return formatTestId('ag-filter-panel');
    },
    filterToolPanelAddFilterButton(): string {
        return formatTestId('ag-filter-panel-add-filter-button');
    },
    filterToolPanelFilterTypeSelector(colLabel?: string | null): string {
        return formatTestId('ag-filter-panel-filter-type-selector', { colLabel });
    },

    /** Filter Tool Panel (Old) */

    filterToolPanelSearchInput(): string {
        return formatTestId('ag-filter-toolpanel-search-input');
    },
    filterToolPanelGroup(title?: string | null): string {
        return formatTestId('ag-filter-toolpanel-group', { title });
    },
    filterToolPanelGroupCollapsedIcon(title?: string | null): string {
        return formatTestId('ag-filter-toolpanel-group-collapsed-icon', { title });
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

    /** Fill Handle */
    fillHandle(): string {
        return formatTestId('ag-fill-handle');
    },

    /** Column Chooser */
    columnChooserCloseButton(): string {
        return formatTestId('ag-column-chooser-close-button');
    },
    columnChooserSearchBarCheckbox(): string {
        return formatTestId('ag-column-chooser-header-checkbox');
    },
    columnChooserSearchBarFilter(): string {
        return formatTestId('ag-column-chooser-searchbar-filter');
    },
    columnChooserListItemGroupClosedIcon(label: string | null): string {
        return formatTestId('ag-column-chooser-list-item-group-closed-icon', { label });
    },
    columnChooserListItemCheckbox(label: string | null): string {
        return formatTestId('ag-column-chooser-list-item-checkbox', { label });
    },
    columnChooserListItemDragHandle(label: string | null): string {
        return formatTestId('ag-column-chooser-list-item-drag-handle', { label });
    },

    /** Overlay */
    overlay(): string {
        return formatTestId('ag-overlay');
    },
};

type AgTestIds = typeof agTestIdFor;
type Locators<TLocator> = {
    [P in keyof AgTestIds]: (...args: Parameters<AgTestIds[P]>) => TLocator;
};

/**
 * Utility function to wrap the agTestIdFor functions to a specific testing framework to reduce code duplication and improve readability.
 *
 * @param fn - A function that takes a string and returns a locator for that string.
 * @returns Same functions as agTestIdFor, but returning a locator instead of a string.
 *
 * @example
 * // Playwright
 * // Before
 * await expect(page.getByTestId(agTestIdFor.rowNode('0'))).toBeVisible();
 * await expect(page.getByTestId(agTestIdFor.cell('0', 'color'))).toBeVisible();
 *
 * // After
 * const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));
 *
 * await expect(agIdFor.rowNode('0')).toBeVisible();
 * await expect(agIdFor.cell('0', 'color')).toBeVisible();
 */
export const wrapAgTestIdFor = <TLocator>(fn: (str: string) => TLocator): Locators<TLocator> => {
    const locators: Partial<Locators<TLocator>> = {};

    const keys = Object.keys(agTestIdFor) as (keyof AgTestIds)[];
    for (const k of keys) {
        locators[k] = (...args: any[]) => {
            return fn((agTestIdFor[k] as any)(...args));
        };
    }

    return locators as Locators<TLocator>;
};
