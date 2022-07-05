---
title: "Cell Editing"
---

## Enable Editing

To enable Cell Editing for a Column, set `editable=true` on the Column Definition.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'name',
            // turns on editing
            editable: true
        }
    ]
}
</snippet>

By default the grid provides simple string editing and stores the result as a string. The example below shows string editing enabled on all columns by setting `editable=true` on the `defaultColDef`.

<grid-example title='Simple Cell Editing' name='simple-editing' type='generated'></grid-example>


## Editing Events

Cell editing results in the following events.

<api-documentation source='grid-events/events.json' section='editing' names='["cellValueChanged","cellEditingStarted","cellEditingStopped","rowEditingStarted","rowEditingStopped","cellEditRequest"]' config='{"overrideBottomMargin":"0rem", "hideMore":false}'></api-documentation>

