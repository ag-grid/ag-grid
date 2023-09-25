---
title: "Row Selection"
---

Row Selection enables users to choose rows by clicking on them. This page describes how to configure row selection in the grid.

## Row Selection Mode

Row selection has two different modes, enabled by passing a value to the `rowSelection` grid option.
- **"single"** only allows users to have one row selected at any time.
- **"multiple"** allows users to select multiple rows at a time by holding <kbd>Ctrl</kbd>, or <kbd>Shift</kbd> to select a range.

<grid-example title='rowSelection' name='row-selection-mode' type='generated'></grid-example>

<snippet>
const gridOptions = {
    rowSelection: 'single',
}
</snippet>

## Multi-Select By Default

When `rowMultiSelectWithClick` is enabled, selecting a row will not deselect other rows. Clicking a selected row will deselect it.

<grid-example title='rowMultiSelectWithClick' name='row-selection-multiple-with-click' type='generated'></grid-example>

This behaviour requires the `rowSelection` grid option to be set to **"multiple"**.

<snippet>
const gridOptions = {
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
}
</snippet>

## Using Checkboxes for Selection

Enabling the `colDef` property `checkboxSelection` adds a checkbox to every cell in that column. These checkboxes can be used to toggle the selection state of rows.

<grid-example title='checkbox' name='row-selection-checkboxes' type='generated'></grid-example>

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'athlete', checkboxSelection: true },
    ],
}
</snippet>

### Checkboxes via Callback

The `colDef` property `checkboxSelection` can also be supplied a function. This allows dynamically setting whether a cell displays a checkbox.

<grid-example title='checkbox' name='row-selection-checkboxes-callback' type='generated'></grid-example>

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            checkboxSelection: (params) => {
                return params.node.data.year === 2008;
            },
        },
    ],
}
</snippet>

<note>When returning false from a callback, the grid will still provide space for the checkbox in the DOM to ensure cell data remains aligned.</note>

### Show Disabled Checkboxes

When the `colDef` property `showDisabledCheckboxes` is enabled, this causes a disabled checkbox to be displayed for rows which have been configured to omit the checkbox.

<grid-example title='checkbox' name='row-selection-checkboxes-show-disabled' type='generated'></grid-example>

This can be used when:
- `checkboxSelection` is configured with a callback function which returns false for a row.
- `isRowSelectable` returns false for a row.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            checkboxSelection: (params) => {
                return params.node.data.year === 2008;
            },
            showDisabledCheckboxes: true,
        },
    ],
}
</snippet>

### Select-All Checkbox

When the `colDef` property `headerCheckboxSelection` is enabled, a checkbox is displayed in the column header which selects or deselects all rows.

*TODO* INSERT EXAMPLE DEMONSTRATING `colDef.headerCheckboxSelection` PROPERTY, this should have toggles for `headerCheckboxSelectionFilteredOnly` and `headerCheckboxSelectionCurrentPageOnly`

A callback can be provided to this property to dynamically set whether the checkbox is displayed.

## Prevent Selection of Rows

The `isRowSelectable` property is a callback that determines which rows can be selected.

<grid-example title='checkbox' name='row-selection-isrowselectable' type='generated'></grid-example>

<snippet>
const gridOptions = {
    isRowSelectable: (rowNode) => rowNode.data ? rowNode.data.year === 2008 : false,
}
</snippet>

<note>This differs from returning false from a checkbox callback as it also prevents row selection via the API and select-all checkboxes.</note>

## Selecting Row Groups (enterprise)

See the [Selecting Groups](/grouping-selecting-groups/) section for more information on configuration specific to Row Grouping.

## Reference

### Grid API

<api-documentation source='grid-api/api.json' section='selection' names='["selectAll","deselectAll","selectAllFiltered","deselectAllFiltered","selectAllOnCurrentPage", "deselectAllOnCurrentPage", "getSelectedNodes", "getSelectedRows", "setNodesSelected"]'></api-documentation>


### Events

<api-documentation source='grid-events/events.json' section='selection' names='["rowSelected", "selectionChanged"]'></api-documentation>
.