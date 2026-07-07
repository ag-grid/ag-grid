import type { VersionChangelog } from '@ag-website-shared/changes/change-types';

export const v35: VersionChangelog = {
    dependencyChanges: [
        {
            dependency: 'angular',
            minVersion: '18',
            reason: 'Angular 17 reached end of life.',
        },
    ],
    removalsWithoutDeprecation: [
        // ### Typing change
        //
        // - `cellDataType` - removed from the `columnTypes` type as its value was always ignored.
        {
            oldApi: '`cellDataType` in the `columnTypes` type',
            oldDescription:
                'a property whose value was always ignored in column type definitions, because data types are resolved before column types are merged',
            newApi: 'setting `cellDataType` on the column definition or `defaultColDef`',
            detectWords: ['columnTypes', 'cellDataType'],
            mitigation:
                'Remove `cellDataType` from entries in `columnTypes` — it never had an effect there. Set it on the column definition or `defaultColDef` instead. This is a type-only change; runtime behaviour is unchanged.',
        },
        // - `colId` - removed from the `autoGroupColumnDef` type as its value was always ignored. Use the `autoGroupColumnDef.context` to store any auto-group column specific data.
        //
        {
            oldApi: '`colId` in the `autoGroupColumnDef` type',
            oldDescription: 'a property whose value was always ignored on the auto-group column definition',
            newApi: '`autoGroupColumnDef.context` for storing auto-group column specific data',
            detectWords: ['autoGroupColumnDef'],
            mitigation:
                'Remove `colId` from `autoGroupColumnDef` — it never had an effect. Use `autoGroupColumnDef.context` to store any auto-group column specific data.',
        },
    ],
    // ### Integrated Charts
    //
    // - Refer to [Upgrade to AG Charts 13](https://www.ag-grid.com/charts/r/upgrade-to-ag-charts-13/) for behaviour and breaking changes.
    //
    // (cross-product AG Charts changes belong to the charts changes database — see
    // tmp_backfill-plan.md)
    behaviourChanges: [
        // ## Behaviour Changes
        //
        // ### Column Sizing
        //
        // - Setting `colDef.suppressAutoSize` now applies to all means of column auto-sizing (API, column menu & double click on column divider) .This is now in line with the `colDef.suppressSizeToFit` behavior.
        //
        {
            title: '`colDef.suppressAutoSize` applies to all means of column auto-sizing (API, column menu and double click on the column divider)',
            description: 'This is in line with the `colDef.suppressSizeToFit` behaviour.',
            detectWords: ['suppressAutoSize'],
            // null: accept-only; the implementing commit (c1b438613) adds no per-route
            // opt-out — suppressAutoSize is all-or-nothing, so the previous
            // double-click-only scope cannot be restored
            mitigation: null,
        },
        // ### Overlays
        //
        // - When filtering the grid and no results are returned a default “No matching rows” overlay will be displayed. You can suppress this by setting grid option `suppressOverlays=['noMatchingRows']`.
        {
            title: 'When filtering leaves no rows to show, a "No matching rows" overlay is displayed',
            description:
                'The overlay is shown by the Client-Side, Infinite and Server-Side row models whenever any filter (column, quick or advanced) leaves zero rows. It also appears in apps with a custom `noRowsOverlayComponent`, which does not apply to this overlay.',
            // null: filtering reaches the grid via column filters, the quickFilterText API
            // or the Advanced Filter — no static token covers all routes
            detectWords: null,
            mitigation: "Set the grid option `suppressOverlays: ['noMatchingRows']`.",
        },
        // - When exporting the grid (Excel/CSV) via the UI an overlay will be displayed with a default message “Exporting”. You can suppress this by setting grid option `suppressOverlays=['exporting']`.
        {
            title: 'Exporting the grid to Excel/CSV displays an "Exporting" overlay',
            description:
                'The overlay is shown for exports triggered from the default context menu and via `exportDataAsCsv`/`exportDataAsExcel`. The non-downloading `getDataAsCsv`/`getDataAsExcel` calls do not show it.',
            // null: the default enterprise context menu includes CSV/Excel export items
            // with zero app configuration, so no token reliably identifies affected apps
            detectWords: null,
            mitigation: "Set the grid option `suppressOverlays: ['exporting']`.",
        },
        // - When using SSRM and Infinite row models “No rows” and “No matching rows” overlays have been added. You can suppress this by setting grid option `suppressOverlays=['noRows','noMatchingRows']`.
        //
        {
            title: 'The Server-Side and Infinite row models display "No rows" and "No matching rows" overlays',
            // these match the mandatory quoted rowModelType values 'serverSide'/'infinite';
            // 'infinite' also matches CSS animations etc. — acceptable false positives
            detectWords: ['serverSide', 'infinite'],
            mitigation: "Set the grid option `suppressOverlays: ['noRows', 'noMatchingRows']`.",
        },
        // ### Column Filters
        //
        // - The built-in Date, DateTime and Number filters validate in-range values, ensuring that the start value is smaller than the end value.
        //
        {
            title: 'The built-in Date, DateTime and Number filters validate in-range values, ensuring that the start value is smaller than the end value',
            description:
                'An invalid range shows a native validity message on the offending input and the filter is not applied — values are not swapped or coerced.',
            // null: the built-in filters are enabled by default for inferred data types, so
            // no code marker can rule apps out
            detectWords: null,
            // null: accept-only; canApply() rejects invalid inputs unconditionally
            // (ca25cc3ec99) — no filterParams opt-out exists
            mitigation: null,
        },
        // ### Integrated Charts
        //
        // - Previously, Integrated Charts automatically used the group column as the chart category when the grid was row-grouped and values were added to leaf nodes. This implicit behaviour has been removed. A new chart option `useGroupColumnAsCategory` must now be set to `true` to display grouped categories.
        //
        {
            title: 'Integrated Charts do not automatically use the group column as the chart category when the grid is row-grouped',
            description:
                'The implicit behaviour where the group column became the chart category when the grid was row-grouped and values were added to leaf nodes was removed in v35. This applies to range charts, whether user-created or created via the API; pivot and cross-filter charts are unaffected.',
            // pivot/cross-filter chart APIs deliberately excluded — those routes are
            // unaffected (the option only exists on range chart params)
            detectWords: ['enableCharts', 'createRangeChart'],
            mitigation:
                'Pass `useGroupColumnAsCategory: true` in the params of `api.createRangeChart(...)` (or `api.updateChart(...)` for existing charts) to display grouped categories.',
        },
    ],
    styleChanges: [
        // ## Styling Changes
        //
        // ### Indicator line
        //
        // - Increased column insertion indicator line from 1px to 3px for better visibility.
        // - Increased row insertion indicator line from 1px to 3px for better visibility.
        //
        {
            // REVIEW: the shipped change is 1px -> 2px, not 3px — d546b8dd4cc set 3px, then
            // ea6d0ecf79a reduced it to 2px before release; the upgrade page still says 3px
            // and needs correcting
            title: 'The column and row insertion indicator lines increased from 1px to 2px for better visibility',
            // null: visual default affecting all apps with column/row dragging; no code
            // marker exists
            detectWords: null,
            mitigation:
                'Set the `rowDragIndicatorWidth` and `columnDragIndicatorWidth` theme parameters (or the `--ag-row-drag-indicator-width` / `--ag-column-drag-indicator-width` CSS variables) to 1 to restore the previous width.',
        },
        // ### Column Filters
        //
        // - When a column has a filter applied the filtered icon state is shown in the filters tool panel.
        //
        {
            title: 'When a column has a filter applied, the filtered icon state is shown in the filters tool panel',
            description: 'Applies to the classic filters tool panel (`agFiltersToolPanel`).',
            // the tool panel only exists when the sideBar grid option is set; false
            // positives from columns-only side bars are acceptable
            detectWords: ['sideBar'],
            // null: accept-only; the indicator is a pure-CSS ::after element with no option
            // to disable it
            mitigation: null,
        },
        // ### Loading
        //
        // - Loading states across the grid now show a spinner alongside the text.
        //
        {
            title: 'Loading states across the grid show a spinner alongside the text',
            // null: visual default affecting all apps; no code marker
            detectWords: null,
            mitigation:
                'Set the `overlayLoadingTemplate` grid option or provide a custom `loadingOverlayComponent` to control the loading overlay content, or override the `overlayLoading` icon via custom icons / theme icon overrides.',
        },
        // ### Row Dragging
        //
        // - When sorting, filtering or pivoting in managed row dragging the row drag handle is shown as disabled instead of hidden.
        //
        {
            title: 'When sorting, filtering or pivoting with managed row dragging, the row drag handle is shown as disabled instead of hidden',
            description:
                'Sorting and filtering always disable the handle; pivoting disables it only when `refreshAfterGroupEdit` is enabled, and otherwise keeps it hidden.',
            // the disabled state only occurs with rowDragManaged: true; unmanaged row
            // dragging is unaffected
            detectWords: ['rowDragManaged'],
            mitigation:
                'The disabled state is applied via the `.ag-drag-handle-disabled` CSS class (not documented API); override it, e.g. `.ag-drag-handle-disabled { visibility: hidden; }`, to restore the previous hidden appearance.',
        },
    ],
};
