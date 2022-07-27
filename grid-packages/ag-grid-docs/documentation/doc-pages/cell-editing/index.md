---
title: "Cell Editing"
---

## Enable Editing

To enable Cell Editing for a Column use the `editable` property on the Column Definition.

<api-documentation source='column-properties/properties.json' section='editing' names='["editable"]'></api-documentation>

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'name',
            // enables editing
            editable: true
        }
    ]
}
</snippet>

By default the grid provides simple string editing and stores the result as a string. The example below shows string editing enabled on all columns by setting `editable=true` on the `defaultColDef`.

<grid-example title='Simple Cell Editing' name='simple-editing' type='generated'></grid-example>

## Conditional Editing

The grid supports enabling editing conditionally on a per cell bases via the `editable` callback. Implement your custom logic to decided whether a cell can be edited in the callback and this will be called when the user attempts to edit the given cell.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    defaultColDef:
        {
            // conditionally enables editing for data for 2012
            editable: (params) => params.data.year == 2012
        }
}
</snippet>

In the following example note the following:

 - Use the buttons to dynamically update which cells can be edited.
 - Conditional on the `year` and `column`
 - Cell style is applied with the same logic to highlight editable cells blue.

<grid-example title='Conditional Cell Editing' name='conditional-editing' type='generated'></grid-example>

## Editing Events

Cell editing results in the following events.

<api-documentation source='grid-events/events.json' section='editing' names='["cellValueChanged","cellEditingStarted","cellEditingStopped","rowEditingStarted","rowEditingStopped","cellEditRequest"]' config='{"overrideBottomMargin":"0rem", "hideMore":false}'></api-documentation>

