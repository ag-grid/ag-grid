---
title: "Upgrading to AG Grid 31.1"
---

## What's New

See the [release post](https://blog.ag-grid.com/whats-new-in-ag-grid-31-1/) for details of what's new in this minor version.

## Codemods

Follow these steps to upgrade your project's AG Grid version to `31.1.0`:

1. Open a terminal and navigate to your project's root folder.

2. Update any AG Grid dependencies listed in your project's `package.json` to version `31.1.0`.

3. Run the `migrate` command of version `31.1` of the AG Grid codemod runner:

    ```
    npx @ag-grid-community/cli@31.1 migrate
    ```

    This will update your project's source files to prepare for the new release.

    By default the Codemod runner will locate all source files within the current directory. For projects with more specific requirements, pass a list of input files to the `migrate` command, or specify the `--help` argument to see more fine-grained usage instructions.

<note>
The Codemod runner will check the state of your project to ensure that you don't lose any work. If you would rather see a diff of the changes instead of applying them, pass the `--dry-run` argument.
</note>

See the [Codemods](/codemods/) documentation for more details.

<framework-specific-section frameworks="react">
<h2 id="migrating-to-use-reactivecustomcomponents">Migrating Custom Components to Use reactiveCustomComponents Option</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|Custom components can now be created more easily by setting `reactiveCustomComponents`. Custom components built in an imperative way (without setting `reactiveCustomComponents`) may need to be rebuilt in order to work with the setting enabled. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be `true` by default, and custom components built in an imperative way will still be supported as an optional behaviour.
|
|Please note that enabling this setting affects all custom components and you cannot use a mix of reactive custom components and imperative custom components in the same grid instance. 
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-cell-editor-components">Custom Cell Editor Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `getValue` is no longer used. The component will be passed `value` as a prop with the latest value (and `initialValue` with the value when editing started). When the value is updated in the UI, the component should call the prop `onValueChange` with the updated value.
|- Any other date methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridCellEditor`. These are all optional; the hook is only needed if the callbacks are required.
|- If using `api.getCellEditorInstances`, the instance returned will now be a wrapper. To get the React custom cell editor component, use the helper function `getInstance` with the returned wrapper instance. See [Accessing Cell Editor Instances](/component-cell-editor/#accessing-cell-editor-instances).
|
|See [Implementing a Cell Editor Component](/component-cell-editor/#implementing-a-cell-editor-component) for examples and more details on the interfaces.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-date-components">Custom Date Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `getDate` and `setDate` are no longer used. The component will be passed `date` as a prop with the latest date. When the date is updated in the UI, the component should call the prop `onDateChange` with the updated date (instead of calling the prop `onDateChanged` when the date changes).
|- Any other editing methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridDate`. These are all optional; the hook is only needed if the callbacks are required.
|
|See [Implementing a Date Component](/component-date/#implementing-a-date-component) for examples and more details on the interfaces.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-filter-components">Custom Filter Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `isFilterActive` method is no longer used. If the model is `null`, the filter is treated as inactive.
|- `getModel` and `setModel` are no longer used. The component will be passed `model` as a prop with the latest model. When the filter is updated in the UI, the component should call the prop `onModelChange` with the updated model (instead of calling the prop `filterChangedCallback` when the model changes).
|- The `filterModifiedCallback` prop is replaced with the prop `onUiChange`.
|- Any other filter methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridFilter`. `doesFilterPass` is a mandatory callback; all others are optional.
|- If using `api.getColumnFilterInstance` (or `api.getFilterInstance`, which has been deprecated by `api.getColumnFilterInstance`), the instance returned will now be a wrapper. To get the React custom filter component, use the helper function `getInstance` with the returned wrapper instance. See [Accessing the Component Instance](/component-filter/#accessing-the-component-instance).
|
|See [Implementing a Filter Component](/component-filter/#implementing-a-filter-component) for examples and more details on the interfaces.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-floating-filter-components">Custom Floating Filter Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `onParentModelChanged` is no longer used. The component will be passed `model` as a prop with the latest model. When the filter is updated in the UI, the component should call the prop `onModelChange` with the updated model (instead of calling the prop `parentFilterInstance` and setting the updated value directly on the parent filter instance when the model changes).
|- Any other filter methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridFloatingFilter`. These are all optional; the hook is only needed if the callbacks are required.
|
|See [Implementing a Floating Filter Component](/component-floating-filter/#implementing-a-floating-filter-component) for examples and more details on the interfaces.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-cell-editor-components">Custom Status Bar Panel Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- If using `api.getStatusPanel`, the instance returned will now be a wrapper. To get the React custom status bar panel component, use the helper function `getInstance` with the returned wrapper instance. See [Accessing Status Bar Panel Instances](/component-status-bar/#accessing-status-bar-panel-instances).
</framework-specific-section>

## Deprecations

This release includes the following deprecations:

### GridOptions

* `gridOptions.cellFlashDelay` - deprecated, use `gridOptions.cellFlashDuration` instead.
* `gridOptions.cellFadeDelay` - deprecated, use `gridOptions.cellFadeDuration` instead.
* `colDef.floatingFilterComponentParams.suppressFilterButton` - deprecated, use `colDef.suppressFloatingFilterButton` instead.

### Column Filters

* `api.getFilterInstance` - deprecated, use `api.getColumnFilterInstance` instead.

### Column API

* `suppressMenu` - deprecated, use `suppressHeaderMenuButton` instead.
* `columnsMenuParams` - deprecated, use `columnChooserParams` instead. 
* `column.getMenuTabs` - deprecated, use `columns.getColDef.menuTabs ?? defaultValues` instead.

### Grid API 

* `getModel().getRow(index)` - deprecated, use `api.getDisplayedRowAtIndex(index)` instead.
* `getModel().getRowNode(id)` - deprecated, use `api.getRowNode(id)` instead.
* `getModel().getRowCount()` - deprecated, use `api.getDisplayedRowCount()` instead.
* `getModel().isEmpty()` - deprecated, use `!!api.getDisplayedRowCount()` instead.
* `getModel().forEachNode()` - deprecated, use `api.forEachNode()` instead.
* `getFirstDisplayedRow`  - deprecated, use `api.getFirstDisplayedRowIndex` instead. 
* `getLastDisplayedRow`  - deprecated, use `api.getLastDisplayedRowIndex` instead.
* `flashCells`, `flashDelay` and `fadeDelay` params are deprecated in favor of `flashDuration` and `fadeDuration` params.
* `showColumnMenuAfterButtonClick` - deprecated, use `IHeaderParams.showColumnMenu` within a header component, or `api.showColumnMenu` elsewhere.
* `showColumnMenuAfterMouseClick` - deprecated, use `IHeaderParams.showColumnMenuAfterMouseClick` within a header component, or `api.showColumnMenu` elsewhere.
* `removeRowGroupColumn` - deprecated, use  `removeRowGroupColumns` to provide the single string input param in an array.
* `addRowGroupColumn` - deprecated, use `addRowGroupColumns` to provide the single string input param in an array.
* `setColumnPinned` - deprecated, use `setColumnsPinned` to provide the single string input param in an array.
* `removePivotColumn` - deprecated, use `removePivotColumns` to provide the single string input param in an array.
* `addPivotColumn` - deprecated, use `addPivotColumns` to provide the single string input param in an array.
* `addAggFunc` - deprecated, use `addAggFuncs` to provide the single string input param in an array.
* `removeValueColumn` - deprecated, use `removeValueColumns` to provide the single string input param in an array.
* `addValueColumn` - deprecated, use `addValueColumns` to provide the single string input param in an array.
* `autoSizeColumn` - deprecated, use `autoSizeColumns` to provide the single string input param in an array.
* `moveColumn` - deprecated, use `moveColumns` to provide the single string input param in an array.
* `setColumnWidth` - deprecated, use `setColumnWidths` to provide the single string input param in an array.
* `setColumnVisible` - deprecated, use `setColumnsVisible` to provide the single string input param in an array.