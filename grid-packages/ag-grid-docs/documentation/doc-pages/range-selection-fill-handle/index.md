---
title: "Fill Handle"
enterprise: true
---

When working with a Range Selection, a Fill Handle allows you to run operations on cells as you adjust the size of the range.

## Enabling the Fill Handle

To enable the Fill Handle, simply set `enableFillHandle` to `true` in the `gridOptions`.

The `fillHandleDirection` property can be set to `x`, `y` and `xy` in the `gridOptions` to force the preferred axis for the `Fill Handle`. This value is `xy` by default.

[[note]]
| It's important to note that if you enable both `enableFillHandle` and `enableRangeHandle`, the Fill Handle will take precedence.

[[warning]]
| Cells that are **not editable** will not be altered by the Fill Handle.

### Example: Range Selection with Fill Handle

The example below demonstrates the basic features of the fill handle:

- When a range of numbers is selected and that range is extended, the Grid will detect the linear progression of the selected items and fill the extra cells with calculated values.
- When a range of strings or a mix of strings and numbers are selected and that range is extended, the range items will be copied in order until all new cells have been properly filled.
- When a range of numbers is selected and the range is increased while pressing the <kbd>Alt</kbd>/<kbd>Option</kbd> key, the behaviour will be the same as when a range of strings or mixed values is selected.
- When a single cell is selected and the range is increased, the value of that cell will be copied to the cells added to the range.
- When a single cell containing a **number** value is selected and the range is increased while pressing the <kbd>Alt</kbd>/<kbd>Option</kbd> key, that value will be incremented (or decremented if dragging to the left or up) by the value of one until all new cells have been filled.
- When reducing the size of the range, cells that are no longer part of the range will be cleared (set to `null`).

<grid-example title='Fill Handle' name='fill-handle' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

### Example: Preventing Reducing the Range Size

If the behaviour for decreasing selection needs to be prevented, the flag `suppressClearOnFillReduction` should be set to `true`.

<grid-example title='Fill Handle - Range Reduction' name='fill-handle-reduction' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

## Suppressing the Fill Handle

When blocking the Fill Handle for certain columns is part of the requirement, the flag `suppressFillHandle` should be set to `true` in the [ColDef](/column-properties/).

In the example below note the following: 

- The Fill Handle is disabled in the **Country** and **Date** columns.

<grid-example title='Suppress Fill Handle' name='suppress-fill-handle' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

## Custom User Function

Often there is a need to use a custom method to fill values instead of simply copying values or increasing number values using linear progression. In these scenarios, the `fillOperation` callback should be used.

The interface for `fillOperation` is as follows:

```ts
// function for fillOperation
function fillOperation(params: FillOperationParams) => any;

// interface for params
interface FillOperationParams {
    event: MouseEvent, // the MouseEvent that generated the fill operation
    values: any[], // the values that have been processed by the fill operation
    initialValues: any[], // the values that were present before processing started
    currentIndex: number, // index of the current processed value
    currentCellValue: any, // the current value of the cell being `filled`
    api: GridApi, // the grid API
    columnApi: ColumnApi, // the grid Column API
    context: any,  // the context
    direction: string // 'up', 'down', 'left' or 'right'
    column: Column, // the Column of the current cell being changed
    rowNode: RowNode // the RowNode of the current cell being changed
}

// example fillOperation
gridOptions.fillOperation = function(params) {
    return 'Foo';
}
```

[[note]]
| If a `fillOperation` callback is provided, the fill handle will always run it. If the current values are not
| relevant to the `fillOperation` function that was provided, `false` should be returned to allow
| the grid to process the values as it normally would.


### Example: Using Custom User Functions

The example below will use the custom `fillOperation` for the **Day of the week** column, but it will use the default operation for any other column.

<grid-example title='Custom Fill Operation' name='custom-fill-operation' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>

### Example: Skipping Columns in the Fill Operation

The example below will use the custom `fillOperation` to prevent values in the **Country** column from being altered by the Fill Handle.

[[note]]
| When the `fillOperation` function returns `params.currentCellValue` that value is not added to the `params.values` list. This allows users to skip any cells in the Fill Handle operation.

<grid-example title='Skipping Columns' name='skipping-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "range"] }'></grid-example>
