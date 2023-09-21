---
title: "Row Selection"
---

Row Selection enables users to choose rows by clicking on them. This page describes how to configure row selection in the grid.

## Row Selection Mode

Row selection has two different modes, enabled by passing a value to the `rowSelection` grid option.
- `single` allows users to only have one row selected at any time.
- `multiple` allows users to select multiple rows by holding <kbd>Shift</kbd> to select a range, or <kbd>Ctrl</kbd> to multi-select rows.

<grid-example title='rowSelection' name='row-selection-mode' type='generated'></grid-example>

<snippet>
const gridOptions = {
    rowSelection: 'single',
}
</snippet>

## Multi-Select By Default

When `rowMultiSelectWithClick` is enabled, clicking a row will select it without the need to hold <kbd>Ctrl</kbd> to prevent other rows being deselected. Clicking a selected row will deselect it.

<grid-example title='rowMultiSelectWithClick' name='row-selection-multiple-with-click' type='generated'></grid-example>

This behaviour requires the `rowSelection` grid option to be set to `multiple`.

<snippet>
const gridOptions = {
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
}
</snippet>

## Using Checkboxes for Selection

It can be preferable to have users select rows via checkboxes instead of clicking on the row itself. This can be achieved by setting the `checkboxSelection` property on the column definition.

<grid-example title='checkbox' name='row-selection-checkboxes' type='generated'></grid-example>

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'athlete', checkboxSelection: true },
    ],
}
</snippet>

### Checkboxes via Callback

The `checkbox` and `checkboxSelection` properties can also be supplied a function. This allows dynamically setting whether a cell has a checkbox or not.

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

## Prevent Selection of Rows

The `isRowSelectable` callback property can be used to determine which rows can be selected.

<grid-example title='checkbox' name='row-selection-checkboxes-callback' type='generated'></grid-example>

<snippet>
const gridOptions = {
    isRowSelectable: (rowNode) => rowNode.data ? rowNode.data.year === 2008 : false,
}
</snippet>

<note>This differs from returning false from a checkbox callback as it also prevents row selection via the API and select-all checkboxes.</note>

## Displaying Disabled Checkboxes

*TODO* INSERT EXAMPLE DEMONSTRATING `showDisabledCheckboxes` PROPERTY

When one of the row selection properties (`isRowSelectable` or `checkboxSelection`) are configured with a callback that returns false, the checkbox will not be shown. The property `showDisabledCheckboxes` can be used to instead show the checkbox but prevent interaction.

This behaviour requires the column property `checkbox` option to be provided a callback.

## Select-All Header Checkbox

*TODO* INSERT EXAMPLE DEMONSTRATING `colDef.headerCheckboxSelection` PROPERTY, this should have toggles for `headerCheckboxSelectionFilteredOnly` and `headerCheckboxSelectionCurrentPageOnly`

The `colDef` property `headerCheckboxSelection` can be enabled to display a checkbox in the column header to select or deselect all rows.

A callback can be provided to this property to dynamically set whether the checkbox is displayed.

## API Reference

<api-documentation source='grid-api/api.json' section='selection' names='["selectAll","deselectAll","selectAllFiltered","deselectAllFiltered","getSelectedNodes", "getSelectedRows", "setNodesSelected"]'></api-documentation>


### Events

<api-documentation source='grid-events/events.json' section='selection' names='["rowSelected", "selectionChanged"]'></api-documentation>



### Accessible Selection with the Keyboard

The grid does not include keyboard row selection by default. You can implement this yourself using the grid API.


*TODO* INSERT EXAMPLE DEMONSTRATING KEYBOARD SELECTION

The example above demonstrates how to implement keyboard row selection. Note the following:
    - `navigateToNextCell` has been overridden to provide a callback when keyboard navigation is used.
    - `gridApi.setNodesSelected` is used to select the row which has been navigated to.

See [Custom Navigation](/keyboard-navigation/#custom-navigation) for more information on this topic.


## Selecting Row Groups (enterprise)

Continue to the [Selecting Groups](/grouping-selecting-groups/) section for more information on configurations specific to Row Grouping.

