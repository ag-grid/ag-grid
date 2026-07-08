import type { VersionChangelog } from '@ag-website-shared/changes/change-types';

export const v35 = {
    dependencyChanges: [
        {
            dependency: 'angular',
            minVersion: '18.0.0',
            reason: 'Angular 17 reached end of life and is no longer supported by the Angular team.',
        },
        {
            dependency: 'typescript',
            minVersion: '5.4.5',
            reason: null,
        },
    ],

    removalsWithoutDeprecation: [
        {
            oldApi: '`cellDataType` in the `columnTypes` grid option',
            oldDescription: '`columnTypes[typeName].cellDataType` was always ignored at runtime.',
            newApi: '`cellDataType` on a `ColDef` or on `defaultColDef`',
            detectWords: ['cellDataType'],
            mitigation:
                'For each use of `cellDataType`, determine if it is on a column definition (correct) or a columnTypes entry (incorrect), and ignore the ones on a ColDef. Running type checking will probably flag the usages at the incorrect location. To keep the same behaviour and fix the compile error, remove `cellDataType` from any `columnTypes` entry (since this value was ignored at runtime, removing it has no effect). Tell the user that you have done this - although removing the entry preserves the existing behaviour, this may be reflective of a bug in the application. If the code author believed that the `cellDataType` would be honoured.',
        },
        {
            oldApi: '`colId` in `autoGroupColumnDef`',
            oldDescription:
                'A `colId` supplied on `autoGroupColumnDef` was always ignored, because the grid assigns the auto group column a fixed id.',
            newApi: '`autoGroupColumnDef.context`',
            newDescription: 'Use `autoGroupColumnDef.context` to store any data specific to the auto group column.',
            detectWords: ['autoGroupColumnDef'],
            mitigation:
                'Remove `colId` from your `autoGroupColumnDef`. It never had any effect, as the auto group column is always given a fixed id by the grid, so deleting it changes nothing at runtime. Tell the user that you have done this - although removing the colId preserves the existing behaviour, this may be reflective of a bug in the application. If the code author believed that the id would be available later, it may be necessary to use `autoGroupColumnDef.context` instead.',
        },
    ],

    newRequirements: [
        // ### Integrated Charts
        //
        // - Refer to [Upgrade to AG Charts 13](https://www.ag-grid.com/charts/r/upgrade-to-ag-charts-13/) for behaviour and breaking changes.
        //
        // TODO this kind of breaking change should be handled by the charts breaking changes records, ensure we have test cases for it
        // {
        //     title: 'Integrated Charts uses AG Charts 13',
        //     description:
        //         'Applications using Integrated Charts are affected by the behaviour and breaking changes in AG Charts 13.',
        //     detectWords: [
        //         'IntegratedChartsModule',
        //         'SparklinesModule',
        //         'enableCharts',
        //         'ag-charts-enterprise',
        //         'ag-grid-charts-enterprise',
        //         'ag-charts-community',
        //     ],
        //     mitigation:
        //         'Refer to [Upgrade to AG Charts 13](https://www.ag-grid.com/charts/r/upgrade-to-ag-charts-13/).',
        // },
    ],

    behaviourChanges: [
        {
            title: 'Setting `colDef.suppressAutoSize` now applies to all methods of auto-sizing the columns',
            description:
                "Before v35, `suppressAutoSize` on a column definition only prevented auto-sizing by double-clicking the header column divider. From v35 it also prevents auto-sizing through the `autoSizeColumns` / `autoSizeAllColumns` API and by the column menu's 'Autosize This Column' / 'Autosize All Columns' items;",
            detectWords: 'suppressAutoSize',
            mitigation:
                'To let a column be auto-sized by the `autoSizeColumns`/`autoSizeAllColumns` API or the column menu again, remove `suppressAutoSize` from its `colDef` (or set it to `false`). This will also enable double-clicking on the header column divider.',
        },
        {
            title: '"No Matching Rows" overlay shown when a filter excludes every row',
            description:
                'When a filter is active and no rows match, the grid shows the provided No Matching Rows overlay. Previously no overlay was shown in this case; the "No Rows" overlay only appeared when the grid had no data at all.',
            // Essentially every app affected, and non-use of filtering is hard to detect
            detectWords: null,
            mitigation:
                "Add 'noMatchingRows' to the `suppressOverlays` grid option, e.g. `suppressOverlays: ['noMatchingRows']`.",
        },
        {
            title: 'Exporting to CSV or Excel displays an "Exporting" overlay while the export runs',
            description:
                'CSV and Excel exports that download a file show the provided Exporting overlay for the duration of the export (a minimum of 300ms). This applies to exports triggered from the UI and to the `exportDataAsCsv()` and `exportDataAsExcel()` API methods; `getDataAsCsv()` and `getDataAsExcel()`, which return data without downloading, do not show the overlay.',
            // No sound detector: file-download exports can be triggered from the default enterprise context menu
            detectWords: null,
            mitigation:
                "Add 'exporting' to the `suppressOverlays` grid option, e.g. `suppressOverlays: ['exporting']`.",
        },
        {
            title: 'The Server-Side and Infinite Row Models display "No Rows" and "No Matching Rows" overlays',
            description:
                'When the Server-Side or Infinite Row Model returns no rows, the grid shows the No Rows overlay, or the No Matching Rows overlay if a filter is active. Previously neither row model displayed an overlay in this case.',
            detectWords: ['serverSide', 'infinite'],
            mitigation:
                "Set the `suppressOverlays` grid option to include the overlays you want to hide: `suppressOverlays: ['noRows', 'noMatchingRows']`.",
        },
        {
            title: 'The built-in Date, DateTime and Number filters validate in-range values, ensuring that the start value is smaller than the end value.',
            description:
                'Before v35 an inverted range (for example From 10, To 5) was applied and simply matched no rows. From v35 the input carries a native validation message and the filter model is not applied while the range is invalid.',
            // Very wide but better than nothing
            detectWords: 'filter',
            mitigation: null,
        },

        {
            title: 'Integrated Charts no longer automatically selects the auto group column as the chart category when grouping is active',
            description:
                'In earlier versions, whenever the grid auto group column was among the dimension columns of the charted range (with row grouping or tree data active), it was always selected as the category dimension. From v35 the auto group column is treated like any other dimension column.',
            detectWords: ['IntegratedChartsModule', 'ag-charts', 'ag-grid-charts', 'createRangeChart', 'updateChart'],
            mitigation:
                'Pass `useGroupColumnAsCategory: true` chart option to restore the old behaviour when using the API. This can be provided to the `createRangeChart` or `updateChart` APIs.',
        },
    ],

    styleChanges: [
        {
            title: 'The column and row drag-and-drop insertion indicator line increased from 1px to 2px',
            description:
                'The insertion indicator lines are shown as feedback in the UI when drag animations are disabled',
            // lines only appear when drag animations disabled
            detectWords: ['suppressMoveWhenColumnDragging', 'rowDrag', 'rowDragManaged', 'rowDragEntireRow'],
            mitigation:
                'Restore the 1px lines by setting the theme parameters `columnDragIndicatorWidth` and `rowDragIndicatorWidth` to `1`. For Legacy Themes, set the CSS variables `--ag-column-drag-indicator-width` and `--ag-row-drag-indicator-width` to `1px` instead.',
        },
        {
            title: 'When a column has a filter applied the filtered icon state is shown in the filters tool panel',
            description:
                "From v35, when a column has an active filter, its icon in the Filters Tool Panel displays the same active-state indicator dot as the column header's filter icon. Previously the tool panel showed only the plain filter icon with no active-state styling.",
            detectWords: 'sideBar',
            mitigation:
                'The icon can be customised by styling .ag-filter-toolpanel-instance-header-icon and .ag-filter-toolpanel-group-instance-header-icon',
        },
        {
            title: 'Loading states across the grid now show a spinner alongside the text',
            description:
                'Anywhere that we show "Loading" text now has a spinner icon, including the loading overlay and Rich Select async-loading',
            detectWords: null,
            mitigation: null,
        },
        {
            title: 'When sorting, filtering or pivoting in managed row dragging the row drag handle is shown as disabled (greyed out) instead of hidden',
            detectWords: ['rowDragManaged'],
            mitigation:
                'To restore the previous behaviour where the drag handle is hidden rather than greyed out, add the following CSS to your application: `.ag-drag-handle-disabled { display: none; }`',
        },
    ],
} satisfies VersionChangelog;
