---
title: "Fill Handle"
enterprise: true
---

When working with a Range Selection, a Fill Handle allows you to run operations on cells as you adjust the size of the range.

## Enabling the Fill Handle

To enable the Fill Handle, simply set `enableFillHandle` to `true` in the `gridOptions` as shown below: 

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country' },
        { field: 'year' },
        { field: 'sport' },
        { field: 'total' }
    ],
    enableRangeSelection: true,
    enableFillHandle: true
}
</snippet>

[[note]]
| It's important to note that if you enable both `enableFillHandle` and `enableRangeHandle`, the Fill Handle will take precedence.

## Default Fill Handle
The default Fill Handle behaviour will be as close as possible to other spreadsheet applications. Note the following: 

### Single Cell

- When a single cell is selected and the range is increased, the value of that cell will be copied to the cells added to the range.
- When a single cell containing a **number** value is selected and the range is increased while pressing the <kbd>Alt</kbd>/<kbd>Option</kbd> key, that value will be incremented (or decremented if dragging to the left or up) by the value of one until all new cells have been filled.

### Multi Cell

- When a range of numbers is selected and that range is extended, the Grid will detect the linear progression of the selected items and fill the extra cells with calculated values.
- When a range of strings or a mix of strings and numbers are selected and that range is extended, the range items will be copied in order until all new cells have been properly filled.
- When a range of numbers is selected and the range is increased while pressing the <kbd>Alt</kbd>/<kbd>Option</kbd> key, the behaviour will be the same as when a range of strings or mixed values is selected.

### Range Reduction

- When reducing the size of the range, cells that are no longer part of the range will be cleared (set to `null`).

<grid-example title='Fill Handle' name='fill-handle' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

## Preventing Range Reduction

Reducing a range selection with the Fill Handle will clear cell contents by default, as can be observed in the 
[Range Reduction](/range-selection-fill-handle/#range-reduction) example above.

If this behaviour for decreasing selection needs to be prevented, the flag `suppressClearOnFillReduction` should be set to `true`.

<grid-example title='Fill Handle - Range Reduction' name='fill-handle-reduction' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

## Fill Handle Axis

By the default, the Fill Handle can be dragged horizontally or vertically. If dragging only vertically, or only horizontally is a requirement, the `gridOptions` property `fillHandleDirection` property can be set or set via the API using `setFillHandleDirection`. This default value is `xy`.

<api-documentation source='grid-options/properties.json' section='selection' names='["fillHandleDirection"]' config='{"overrideBottomMargin":"0"}'></api-documentation>
<api-documentation source='grid-api/api.json' section='selection' names='["setFillHandleDirection"]'></api-documentation>

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country' },
        { field: 'year' },
        { field: 'sport' },
        { field: 'total' }
    ],
    enableRangeSelection: true,
    enableFillHandle: true,
    fillHandleDirection: 'x' // Fill Handle can only be dragged horizontally
}
</snippet>

<grid-example title='Fill Handle - Direction' name='fill-handle-direction' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

## Custom User Function

Often there is a need to use a custom method to fill values instead of simply copying values or increasing number values using linear progression. In these scenarios, the `fillOperation` callback should be used.

<api-documentation source='grid-options/properties.json' section='selection' names='["fillOperation"]'  ></api-documentation>

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country' },
        { field: 'year' },
        { field: 'sport' },
        { field: 'total' }
    ],
    enableRangeSelection: true,
    enableFillHandle: true,
    fillOperation: (fillOperationParams) => {
        return 'Foo';
    }
}
</snippet>

### FillOperationParams
<interface-documentation interfaceName='FillOperationParams'></interface-documentation>

[[note]]
| If a `fillOperation` callback is provided, the fill handle will always run it. If the current values are not relevant to the `fillOperation` function that was provided, `false` should be returned to allow the grid to process the values as it normally would.

The example below will use the custom `fillOperation` for the **Day of the week** column, but it will use the default operation for any other column.

<grid-example title='Custom Fill Operation' name='custom-fill-operation' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

### Skipping Columns in the Fill Operation

The example below will use the custom `fillOperation` to prevent values in the **Country** column from being altered by the Fill Handle.

[[note]]
| When the `fillOperation` function returns `params.currentCellValue` that value is not added to the `params.values` list. This allows users to skip any cells in the Fill Handle operation.

<grid-example title='Skipping Columns' name='skipping-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

[[warning]]
| Non editable cells will **not** be changed by the Fill Handle, so there is no need to add custom logic to skip columns that aren't editable.

## Read Only Edit

When the grid is in [Read Only Edit](/value-setters/#read-only-edit) mode the `Fill Handle` will not update the data inside the grid. Instead the grid fires `cellEditRequest` events allowing the application to process the update request.

The example below will show how to update cell value combining the `Fill Handle` with `readOnlyEdit=true`.

<grid-example title='Fill Handle - ReadOnlyEdit' name='read-only-edit' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

## Suppressing the Fill Handle

The Fill Handle can be disabled on a per column basis by setting the column definition property `suppressFillHandle` to true .

In the example below, please note that the Fill Handle is disabled in the **Country** and **Date** columns.

<grid-example title='Suppress Fill Handle' name='suppress-fill-handle' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>