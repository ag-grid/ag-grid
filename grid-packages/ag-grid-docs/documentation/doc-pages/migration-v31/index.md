---
title: "Upgrade to V31"
---

## What's New

See the [release post](https://blog.ag-grid.com/whats-new-in-ag-grid-31/) for details of what's new in this major version.

## Upgrading to V31

### Using the AG Grid Migration Tool

All major AG Grid releases now come with an accompanying migration tool to help automate the upgrade process. This is the easiest way to make sure your projects stay up-to-date with the latest AG Grid changes.

The migration tool fixes your project's codebase to address the majority of breaking changes and deprecations when upgrading from an older version. This is achieved via codemods, which are small scripts that amend your project's source files to apply any necessary fixes.

Follow these steps to migrate to AG Grid version 31:

1. Open a terminal and navigate to your project's root folder

2. Update the AG Grid dependency to version `31.0.0`:

    ```
    npm install ag-grid-community@31.0.0
    ```

3. Run version `31.0.0` of the AG Grid migration tool:

    ```
    npx @ag-grid-community/cli@31.0.0 migrate
    ```

    This will update your project's source files to prepare for the new release.

    By default the codemod will be applied to all source files within the current directory. For projects with more specific requirements, pass a list of input files to the `migrate` command.

<note>
The migration tool will check the state of your project to ensure that you don't lose any work. If you would rather see a diff of the changes instead of applying them, pass the `--dry-run` argument.
</note>

Caveats to bear in mind when using the migration tool:

- As with any automation workflow, we recommend that you check over any changes made by the migration tool before committing updated source files to your codebase
- In particular, any automatically-applied changes should always be logically correct, however the formatting of the generated code is likely to vary slightly from the rest of your codebase and could require minor tweaking
- While we attempt to automate as many upgrade paths as possible, unusual use cases may still require some manual intervention

### Breaking Changes

This release includes the following breaking changes:

**React:**

* `AgGridReactFire` is no longer exported from `ag-grid-react`. You should use `AgGridReact` instead.
* The loading overlay is now displayed for all row models if column definitions are not provided when the grid is initialised. The rows will also not be created and rendered until the column definitions are provided.
* Validation is now run when `gridOptions` are updated, meaning warnings may appear in console when changing grid options if an invalid configuration is reached.
* Auto-generated group row IDs when using Client-Side Row Model now have a different format (but the same prefix).<br>`rowDataUpdated` event is only fired for the Client-Side Row Model (per the existing documentation)."
* Legacy React Rendering, enabled via `suppressReactUi` property is deprecated since v28 and is now removed.<br>AG Grid now only renders via React components as has been the default since v28.

**ColDef:**

* Grid columns are now sortable and resizable by default. Also, the grid animates rows by default. In order to avoid this, please set `defaultColDef.resizable = false`, `defaultColDef.sortable = false` and `gridOptions.animateRows = false`.

**GridOptions:**

* Javascript - Mutating `gridOptions` after the grid has been created will no longer be picked up by the grid. Instead use `api.setGridOption` (`property`, `newValue`) to update grid options.
* Validation is now run when `gridOptions` are updated, meaning warnings may appear in console when changing grid options if an invalid configuration is reached.

**Column Filters:**

* `IServerSideGetRowsRequest.filterModel` can now be of type AdvancedFilterModel | null if Advanced Filter is enabled, or FilterModel otherwise (for Column Filters).
* There are new localisation keys for the Date Filter - `lessThan` is now `before`, and `greaterThan` is now `after`. As these are new localization keys which don't appear in your localization dictionaries, you will see the English strings for "before" and "after" used in the date filter options list. Please provide translations for these 2 new keys in your localized dictionaries to display your translation instead.

**Export:**

* `ExcelExportParams` no longer have the following options (removed without replacement):
    * `exportMode`
    * `suppressTextAsCDATA`

**Pagination:**

* When showing the pagination controls, the page size selector is shown by default.

**Row Grouping:**

* Group values will no longer be typeless, and will be inferred from the first row when they were created

**Integrated Charts:**

* The `solar` and `pastel` integrated chart themes have been removed. Any saved chart models will be migrated to the new `polychroma` and `sheets` themes respectively.


**API:**

* Deprecated grid option `rememberGroupStateWhenNewData` has been removed. Provide `getRowId` to maintain group state when row data updated (see https://ag-grid.com/javascript-data-grid/data-update-row-data/).

* Removal of v28 deprecations in v31 release:

    * Column API:

        - `getAllColumns`: use `api.getColumns`.
        - `getPrimaryColumns`: use `api.getColumns`.
        - `getSecondaryColumns`: use `api.getPivotResultColumns`.
        - `setSecondaryColumns`: use `api.setPivotResultColumns`.
        - `getSecondaryPivotColumn`: use `api.getPivotResultColumn`.

    * Grid API:

        - `refreshServerSideStore`: use `refreshServerSide`.
        - `getServerSideStoreState`: use `getServerSideGroupLevelState`.
        - `setProcessSecondaryColDef`: use `api.setGridOption`(`processPivotResultColGroupDef`, `newValue`).
        - `setProcessSecondaryColGroupDef`: use `api.setGridOption`(`setProcessPivotResultColGroupDef`, `newValue`).
        - `setGetServerSideStoreParams`: use `api.setGridOption`(`getServerSideGroupLevelParams`, `newValue`).

    * GridOptions:

        - `serverSideStoreType`: removed in favour of `suppressServerSideInfiniteScroll`. When false, Partial Store is used. When true, Full Store is used.
        - `serverSideSortingAlwaysResets`: use `serverSideSortAllLevels`.
        - `serverSideFilteringAlwaysResets`: use `serverSideOnlyRefreshFilteredGroups`.
        - `processSecondaryColDef`: use `processPivotResultColDef`.
        - `processSecondaryColGroupDef`: use `processPivotResultColGroupDef`.
        - `getServerSideStoreParams`: use `getServerSideGroupLevelParams`.
        - `onRowDataChanged`: no longer fired, use `onRowDataUpdated`.

    * SSRM Interfaces:

        - `ServerSideGroupLevelParams.storeType`: removed in favour of `suppressInfiniteScroll`. When false, Partial Store is used. When true, Full Store is used.
        - `IsApplyServerSideTransactionParams.storeInfo`: use `IsApplyServerSideTransactionParams.groupLevelInfo`.
        - `LoadSuccessParams.storeInfo`: use `LoadSuccessParams.groupLevelInfo`.
        - `IServerSideGetRowsParams.successCallback`: use `success` method instead with `LoadSuccessParams` params.
        - `IServerSideGetRowsParams.failCallback`: use `fail`. 
        - interface `ServerSideStoreParams`: use `ServerSideGroupLevelParams`.
        - interface `GetServerSideStoreParamsParams`: use `GetServerSideGroupLevelParamsParams`.
        - interface `RefreshStoreParams`: use `RefreshServerSideParams`.
        - interface `ServerSideGroupState`: use `ServerSideGroupLevelState`.

    * ExportParams 

        - `columnGroups`: groups are exported by default.
        - `skipGroups`: use `skipRowGroups`.
        - `skipHeader`: use `skipColumnHeaders`.
        - `customFooter`: use `appendContent`.
        - `customHeader`: use `prependContent`.
        - interface `RangeSelection`: Use `CellRange`.
        - interface `AddRangeSelectionParams`: Use `CellRangeParams`.

    * React 

        - `rowDataChangeDetectionStrategy`: identity / reference equals always used.


### Deprecations

This release includes the following deprecations:

**Column Filters:**

* `IFilterParams.valueGetter` is deprecated in favour of `IFilterParams.getValue`, which provides a simpler method of retrieving cell values.

**GridOptions:**

* Grid option `advancedFilterModel` is deprecated in favour of `initialState.filter.advancedFilterModel`

**Grid API:** 

* `setGetRowId` is no longer supported - `getRowId` cannot be updated.

* The Grid API methods listed below have been deprecated. Please use Grid API methods `setGridOption` and `updateGridOptions` to set properties instead as described in [Updating Grid Options](https://build.ag-grid.com/react-data-grid/grid-interface/#updating-grid-options).

    * `setPivotMode`
    * `setPinnedTopRowData`
    * `setPinnedBottomRowData`
    * `setPopupParent`
    * `setSuppressModelUpdateAfterUpdateTransaction`
    * `setDataTypeDefinitions`
    * `setPagination`
    * `paginationSetPageSize`
    * `setSideBar`
    * `setSuppressClipboardPaste`
    * `setGroupRemoveSingleChildren`
    * `setGroupRemoveLowestSingleChildren`
    * `setGroupDisplayType`
    * `setGroupIncludeFooter`
    * `setGroupIncludeTotalFooter`
    * `setRowClass`
    * `setDeltaSort`
    * `setSuppressRowDrag`
    * `setSuppressMoveWhenRowDragging`
    * `setSuppressRowClickSelection`
    * `setEnableAdvancedFilter`
    * `setIncludeHiddenColumnsInAdvancedFilter`
    * `setAdvancedFilterParent`
    * `setAdvancedFilterBuilderParams`
    * `setQuickFilter`
    * `setExcludeHiddenColumnsFromQuickFilter`
    * `setIncludeHiddenColumnsInQuickFilter`
    * `setQuickFilterParser`
    * `setQuickFilterMatcher`
    * `setAlwaysShowHorizontalScroll`
    * `setAlwaysShowVerticalScroll`
    * `setFunctionsReadOnly`
    * `setColumnDefs`
    * `setAutoGroupColumnDef`
    * `setDefaultColDef`
    * `setColumnTypes`
    * `setTreeData`
    * `setServerSideDatasource`
    * `setCacheBlockSize`
    * `setDatasource`
    * `setViewportDatasource`
    * `setRowData`
    * `setEnableCellTextSelection`
    * `setHeaderHeight`
    * `setDomLayout`
    * `setFillHandleDirection`
    * `setGroupHeaderHeight`
    * `setFloatingFiltersHeight`
    * `setPivotHeaderHeight`
    * `setPivotGroupHeaderHeight`
    * `setAnimateRows`
    * `setIsExternalFilterPresent`
    * `setDoesExternalFilterPass`
    * `setNavigateToNextCell`
    * `setTabToNextCell`
    * `setTabToNextHeader`
    * `setNavigateToNextHeader`
    * `setRowGroupPanelShow`
    * `setGetGroupRowAgg`
    * `setGetBusinessKeyForNode`
    * `setGetChildCount`
    * `setProcessRowPostCreate`
    * `setGetRowClass`
    * `setIsFullWidthRow`
    * `setIsRowSelectable`
    * `setIsRowMaster`
    * `setPostSortRows`
    * `setGetDocument`
    * `setGetContextMenuItems`
    * `setGetMainMenuItems`
    * `setProcessCellForClipboard`
    * `setSendToClipboard`
    * `setProcessCellFromClipboard`
    * `setProcessPivotResultColDef`
    * `setProcessPivotResultColGroupDef`
    * `setPostProcessPopup`
    * `setInitialGroupOrderComparator`
    * `setGetChartToolbarItems`
    * `setPaginationNumberFormatter`
    * `setGetServerSideGroupLevelParams`
    * `setIsServerSideGroupOpenByDefault`
    * `setIsApplyServerSideTransaction`
    * `setIsServerSideGroup`
    * `setGetServerSideGroupKey`
    * `setGetRowStyle`
    * `setGetRowHeight`

**API:**

* `suppressAsyncEvents`: events should be handled asynchronously.

### Changes List 

If you would like to see the full list of changes in this release, please see the [Changelog](https://www.ag-grid.com/changelog/?fixVersion=31.0.0).