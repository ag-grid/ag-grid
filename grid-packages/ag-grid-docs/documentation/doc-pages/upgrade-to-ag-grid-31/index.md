---
title: "Upgrade to AG Grid 31"
---

## What's New

See the [release post](https://blog.ag-grid.com/whats-new-in-ag-grid-31/) for details of what's new in this major version.

## Codemods

Follow these steps to upgrade your project's AG Grid version to `31.0.0`:

1. Open a terminal and navigate to your project's root folder.

2. Update any AG Grid dependencies listed in your project's `package.json` to version `31.0.0`.

3. Run version `31.0` of the AG Grid codemod:

    ```
    npx @ag-grid-community/cli@31.0 migrate
    ```

    This will update your project's source files to prepare for the new release.

    By default the codemod runner will locate all source files within the current directory. For projects with more specific requirements, pass a list of input files to the `migrate` command, or specify the `--help` argument to see more fine-grained usage instructions.

<note>
The codemod runner will check the state of your project to ensure that you don't lose any work. If you would rather see a diff of the changes instead of applying them, pass the `--dry-run` argument.
</note>

See the [codemods](/codemods/) documentation for more details.

## Breaking Changes

This release includes the following breaking changes:

### React

* `AgGridReactFire` is no longer exported from `ag-grid-react`. You should use `AgGridReact` instead.
    - Codemod: ⏳
* The loading overlay is now displayed for all row models if column definitions are not provided when the grid is initialised. The rows will also not be created and rendered until the column definitions are provided.
    - Codemod: N/A
* Validation is now run when `gridOptions` are updated, meaning warnings may appear in console when changing grid options if an invalid configuration is reached.
    - Codemod: N/A
* Auto-generated group row IDs when using Client-Side Row Model now have a different format (but the same prefix).<br>`rowDataUpdated` event is only fired for the Client-Side Row Model (per the existing documentation)."
    - Codemod: N/A
* Legacy React Rendering, enabled via `suppressReactUi` property is deprecated since v28 and is now removed.<br>AG Grid now only renders via React components as has been the default since v28.
    - Codemod: ✅
* `rowDataChangeDetectionStrategy` - removed. identity / reference equals always used.
    - Codemod: ✅

### Integrated Charts

The `solar` and `pastel` integrated chart themes have been removed. Any saved chart models will be migrated to the new `polychroma` and `sheets` themes respectively. If you're using themeOverrides, see charts migration page as the structure and naming of options have changed.
    - Codemod: ❌

If you are using Standalone Charts, please see changes to charts in the [AG Charts Migration Guide](https://charts.ag-grid.com/react/migration-v9/).

### ColDef

Grid columns are now sortable and resizable by default. Also, the grid animates rows by default. In order to avoid this, please set `defaultColDef.resizable = false`, `defaultColDef.sortable = false` and `gridOptions.animateRows = false`.
    - Codemod: N/A

### GridOptions

* Javascript - Mutating `gridOptions` after the grid has been created will no longer be picked up by the grid. Instead use `api.setGridOption` (`property`, `newValue`) to update grid options.
    - Codemod: ❌
* Validation is now run when `gridOptions` are updated, meaning warnings may appear in console when changing grid options if an invalid configuration is reached.
    - Codemod: N/A
* `serverSideStoreType` - removed, use `suppressServerSideInfiniteScroll` instead. When false, Partial Store is used. When true, Full Store is used.
    - Codemod: ✅
* `serverSideSortingAlwaysResets` - removed, use `serverSideSortAllLevels` instead.
    - Codemod: ✅
* `serverSideFilteringAlwaysResets` - removed, use `serverSideOnlyRefreshFilteredGroups` instead.
    - Codemod: ✅
* `processSecondaryColDef` - removed, use `processPivotResultColDef` instead.
    - Codemod: ✅
* `processSecondaryColGroupDef` - removed, use `processPivotResultColGroupDef` instead.
    - Codemod: ✅
* `getServerSideStoreParams` - removed, use `getServerSideGroupLevelParams` instead.
    - Codemod: ✅
* `onRowDataChanged`: no longer fired, use `onRowDataUpdated` instead.
    - Codemod: ✅
* `getRowId` is now an initial property and can no longer be updated.
* `rememberGroupStateWhenNewData` - removed. Provide getRowId to maintain group state when row data updated instead (see [Updating Row Data](/data-update-row-data/)).

### Column Filters

* `IServerSideGetRowsRequest.filterModel` can now be of type AdvancedFilterModel | null if Advanced Filter is enabled, or FilterModel otherwise (for Column Filters).
    - Codemod: N/A
* Added new localisation keys for the Date Filter - `lessThan` is now `before`, and `greaterThan` is now `after`. Please provide translations for these 2 new keys in your localized dictionaries to display your translation instead of the English strings for "before" and "after".
    - Codemod: N/A

### Row Grouping

Group values will no longer be typeless, and will be inferred from the first row when they were created
    - Codemod: N/A

### Pagination

When showing the pagination controls, the page size selector is shown by default. You can prevent this by setting paginationPageSizeSelector=false
    - Codemod: N/A

### Sever-Side Row Model

* `ServerSideGroupLevelParams.storeType` - removed, use `suppressInfiniteScroll` instead. When false, Partial Store is used. When true, Full Store is used.
    - Codemod: ❌
* `IsApplyServerSideTransactionParams.storeInfo` - removed, use `IsApplyServerSideTransactionParams.groupLevelInfo` instead.
    - Codemod: ❌
* `LoadSuccessParams.storeInfo` - removed, use `LoadSuccessParams.groupLevelInfo` instead.
    - Codemod: ❌
* `IServerSideGetRowsParams.successCallback` - removed, use `success` method with `LoadSuccessParams` params instead.
* `IServerSideGetRowsParams.failCallback` - removed, use `fail` instead.
* interface `ServerSideStoreParams` - removed, use `ServerSideGroupLevelParams` instead.
    - Codemod: ⏳
* interface `GetServerSideStoreParamsParams` - removed, use `GetServerSideGroupLevelParamsParams` instead.
    - Codemod: ⏳
* interface `RefreshStoreParams` - removed, use `RefreshServerSideParams` instead.
    - Codemod: ⏳
* interface `ServerSideGroupState` - removed, use `ServerSideGroupLevelState` instead.
    - Codemod: ⏳

### Export

* `ExcelExportParams` no longer have the following options (removed without replacement due to removing support for export as XML):
    * `exportMode`
        - Codemod: ✅
    * `suppressTextAsCDATA`
        - Codemod: ✅
* `columnGroups`: groups are exported by default.
    - Codemod: ❌
* `skipGroups` - removed, use `skipRowGroups` instead.
    - Codemod: ❌
* `skipHeader` - removed, use `skipColumnHeaders` instead.
    - Codemod: ❌
* `customFooter` - removed, use `appendContent` instead.
    - Codemod: ❌
* `customHeader` - removed, use `prependContent` instead.
    - Codemod: ❌
* interface `RangeSelection` - removed, use `CellRange` instead.
    - Codemod: ⏳
* interface `AddRangeSelectionParams` - removed, use `CellRangeParams` instead.
    - Codemod: ⏳

### Column API

* `getAllColumns` - removed, use `api.getColumns` instead.
    - Codemod: ✅
* `getPrimaryColumns` - removed, use `api.getColumns` instead.
    - Codemod: ✅
* `getSecondaryColumns` - removed, use `api.getPivotResultColumns` instead.
    - Codemod: ✅
* `setSecondaryColumns` - removed, use `api.setPivotResultColumns` instead.
    - Codemod: ✅
* `getSecondaryPivotColumn` - removed, use `api.getPivotResultColumn` instead.
    - Codemod: ✅

### Grid API

* `refreshServerSideStore` - removed, use `refreshServerSide` instead.
    - Codemod: ✅
* `getServerSideStoreState` - removed, use `getServerSideGroupLevelState` instead.
    - Codemod: ✅
* `setProcessSecondaryColDef` - removed, use `api.setGridOption`(`processPivotResultColDef`, `newValue`) instead.
    - Codemod: ✅
* `setProcessSecondaryColGroupDef` - removed, use `api.setGridOption`(`setProcessPivotResultColGroupDef`, `newValue`) instead.
    - Codemod: ✅
* `setGetServerSideStoreParams` - removed, use `api.setGridOption`(`getServerSideGroupLevelParams`, `newValue`) instead.
    - Codemod: ✅

## Deprecations

This release includes the following deprecations:

### GridOptions

* `advancedFilterModel` - deprecated, use `initialState.filter.advancedFilterModel` instead.
* `suppressAsyncEvents` and synchronous event handling is deprecated. Please update your events to be handled asynchronously.

### Column Filters

`IFilterParams.valueGetter` - deprecated, use `IFilterParams.getValue` instead.
    - Codemod: ❌

### Grid API

* `setGetRowId` is now deprecated because `getRowId` can no longer be updated (listed as a breaking change above).
    - Codemod: ✅

* The Grid API methods listed below have been deprecated. Please use Grid API methods `setGridOption` and `updateGridOptions` to set properties instead as described in [Updating Grid Options](/grid-interface/#updating-grid-options/).

    * `setPivotMode`
        - Codemod: ✅
    * `setPinnedTopRowData`
        - Codemod: ✅
    * `setPinnedBottomRowData`
        - Codemod: ✅
    * `setPopupParent`
        - Codemod: ✅
    * `setSuppressModelUpdateAfterUpdateTransaction`
        - Codemod: ✅
    * `setDataTypeDefinitions`
        - Codemod: ✅
    * `setPagination`
        - Codemod: ✅
    * `paginationSetPageSize`
        - Codemod: ✅
    * `setSideBar`
        - Codemod: ✅
    * `setSuppressClipboardPaste`
        - Codemod: ✅
    * `setGroupRemoveSingleChildren`
        - Codemod: ✅
    * `setGroupRemoveLowestSingleChildren`
        - Codemod: ✅
    * `setGroupDisplayType`
        - Codemod: ✅
    * `setGroupIncludeFooter`
        - Codemod: ✅
    * `setGroupIncludeTotalFooter`
        - Codemod: ✅
    * `setRowClass`
        - Codemod: ✅
    * `setDeltaSort`
        - Codemod: ✅
    * `setSuppressRowDrag`
        - Codemod: ✅
    * `setSuppressMoveWhenRowDragging`
        - Codemod: ✅
    * `setSuppressRowClickSelection`
        - Codemod: ✅
    * `setEnableAdvancedFilter`
        - Codemod: ✅
    * `setIncludeHiddenColumnsInAdvancedFilter`
        - Codemod: ✅
    * `setAdvancedFilterParent`
        - Codemod: ✅
    * `setAdvancedFilterBuilderParams`
        - Codemod: ✅
    * `setQuickFilter`
        - Codemod: ✅
    * `setExcludeHiddenColumnsFromQuickFilter`
        - Codemod: ✅
    * `setIncludeHiddenColumnsInQuickFilter`
        - Codemod: ✅
    * `setQuickFilterParser`
        - Codemod: ✅
    * `setQuickFilterMatcher`
        - Codemod: ✅
    * `setAlwaysShowHorizontalScroll`
        - Codemod: ✅
    * `setAlwaysShowVerticalScroll`
        - Codemod: ✅
    * `setFunctionsReadOnly`
        - Codemod: ✅
    * `setColumnDefs`
        - Codemod: ✅
    * `setAutoGroupColumnDef`
        - Codemod: ✅
    * `setDefaultColDef`
        - Codemod: ✅
    * `setColumnTypes`
        - Codemod: ✅
    * `setTreeData`
        - Codemod: ✅
    * `setServerSideDatasource`
        - Codemod: ✅
    * `setCacheBlockSize`
        - Codemod: ✅
    * `setDatasource`
        - Codemod: ✅
    * `setViewportDatasource`
        - Codemod: ✅
    * `setRowData`
        - Codemod: ✅
    * `setEnableCellTextSelection`
        - Codemod: ✅
    * `setHeaderHeight`
        - Codemod: ✅
    * `setDomLayout`
        - Codemod: ✅
    * `setFillHandleDirection`
        - Codemod: ✅
    * `setGroupHeaderHeight`
        - Codemod: ✅
    * `setFloatingFiltersHeight`
        - Codemod: ✅
    * `setPivotHeaderHeight`
        - Codemod: ✅
    * `setPivotGroupHeaderHeight`
        - Codemod: ✅
    * `setAnimateRows`
        - Codemod: ✅
    * `setIsExternalFilterPresent`
        - Codemod: ✅
    * `setDoesExternalFilterPass`
        - Codemod: ✅
    * `setNavigateToNextCell`
        - Codemod: ✅
    * `setTabToNextCell`
        - Codemod: ✅
    * `setTabToNextHeader`
        - Codemod: ✅
    * `setNavigateToNextHeader`
        - Codemod: ✅
    * `setRowGroupPanelShow`
        - Codemod: ✅
    * `setGetGroupRowAgg`
        - Codemod: ✅
    * `setGetBusinessKeyForNode`
        - Codemod: ✅
    * `setGetChildCount`
        - Codemod: ✅
    * `setProcessRowPostCreate`
        - Codemod: ✅
    * `setGetRowClass`
        - Codemod: ✅
    * `setIsFullWidthRow`
        - Codemod: ✅
    * `setIsRowSelectable`
        - Codemod: ✅
    * `setIsRowMaster`
        - Codemod: ✅
    * `setPostSortRows`
        - Codemod: ✅
    * `setGetDocument`
        - Codemod: ✅
    * `setGetContextMenuItems`
        - Codemod: ✅
    * `setGetMainMenuItems`
        - Codemod: ✅
    * `setProcessCellForClipboard`
        - Codemod: ✅
    * `setSendToClipboard`
        - Codemod: ✅
    * `setProcessCellFromClipboard`
        - Codemod: ✅
    * `setProcessPivotResultColDef`
        - Codemod: ✅
    * `setProcessPivotResultColGroupDef`
        - Codemod: ✅
    * `setPostProcessPopup`
        - Codemod: ✅
    * `setInitialGroupOrderComparator`
        - Codemod: ✅
    * `setGetChartToolbarItems`
        - Codemod: ✅
    * `setPaginationNumberFormatter`
        - Codemod: ✅
    * `setGetServerSideGroupLevelParams`
        - Codemod: ✅
    * `setIsServerSideGroupOpenByDefault`
        - Codemod: ✅
    * `setIsApplyServerSideTransaction`
        - Codemod: ✅
    * `setIsServerSideGroup`
        - Codemod: ✅
    * `setGetServerSideGroupKey`
        - Codemod: ✅
    * `setGetRowStyle`
        - Codemod: ✅
    * `setGetRowHeight`
        - Codemod: ✅

## Changes List

If you would like to see the full list of changes in this release, please see the [Changelog](https://www.ag-grid.com/changelog/?fixVersion=31.0.0).
