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
            field: 'athlete',
            // enables editing
            editable: true
        }
    ]
}
</snippet>

By default the grid provides simple string editing and stores the result as a string. The example below shows string editing enabled on all columns by setting `editable=true` on the `defaultColDef`.

<grid-example title='Simple Cell Editing' name='simple-editing' type='generated'></grid-example>

## Conditional Editing

To dynamically determine which cells are editable, a callback function can be supplied to the `editable` property on the Column Definition:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            // conditionally enables editing for data for 2012
            editable: (params) => params.data.year == 2012
        }
    ],
}
</snippet>

In the snippet above, **Athlete** cells will be editable on rows where the **Year** is `2012`.     

This is demonstrated in the following example, note that:

- An `editable` callback is added to the **Athlete** and **Age** columns to control which cells are editable based on the selected **Year**.
- A custom `editableColumn` [Column Type](/column-definitions/#custom-column-types) is used to avoid duplication of the callback for **Athlete** and **Age**.
- Buttons are provided to change the **Year** used by the `editable` callback function to control which cells are editable.    
- A blue [Cell Style](/cell-styles/) has been added to highlight editable cells using the same logic as the `editable` callback.

<grid-example title='Conditional Cell Editing' name='conditional-editing' type='generated'></grid-example>

## Editing Events

Cell editing results in the following events.

<api-documentation source='grid-events/events.json' section='editing' names='["cellValueChanged","cellEditingStarted","cellEditingStopped","rowEditingStarted","rowEditingStopped","cellEditRequest"]' config='{"overrideBottomMargin":"0rem", "hideMore":false}'></api-documentation>

