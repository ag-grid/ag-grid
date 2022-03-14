---
title: "Cell Editing"
---

To enable Cell Editing for a Column, set `editable=true` on the Column Definition.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'name',
            // turns on editing
            editable: true
        },
        {
            field: 'age',
            editable: true
        }
    ]
}
</snippet>

By default the grid provides for simple String editing and stores the result as a String. The example below shows simple String editing on all Columns by setting `editable=true` on the Default Column Definition.

<grid-example title='Simple Cell Editing' name='simple-editing' type='generated'></grid-example>


## Editing Events

Cell editing results in the following events.

<api-documentation source='grid-events/events.json' section='editing' names='["cellValueChanged","cellEditingStarted","cellEditingStopped","rowEditingStarted","rowEditingStopped","cellEditRequest"]' config='{"overrideBottomMargin":"0rem", "hideMore":false}'></api-documentation>

