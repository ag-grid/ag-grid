---
title: "Undo / Redo Edits"
---

This section covers how to allow users to undo / redo their cell edits.

When [Cell Editing](/cell-editing/) is enabled in the grid, it is usually desirable to allow users to undo / redo any edits.

Users can change the contents of cells through the following grid features:

- [Cell Editing](/cell-editing/)
- [Copy / Paste](/clipboard/)
- [Fill Handle](/range-selection-fill-handle/)

[[note]]
| This Undo / Redo feature is designed to be a recovery mechanism for user editing mistakes. Performing grid
| operations that change the row / column order, e.g. sorting, filtering and grouping, will clear the
| undo / redo stacks.

## Enabling Undo / Redo

The following undo / redo properties are provided in the grid options interface:

<snippet>
const gridOptions = {
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 20
}
</snippet>

As shown in the snippet above, undo / redo is enabled through the `undoRedoCellEditing` property.


The default number of undo / redo steps is `10`. To change this default the `undoRedoCellEditingLimit` property can be used.

## Undo / Redo Shortcuts


The following keyboard shortcuts are available when undo / redo is enabled:

- <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Command</kbd>+<kbd>Z</kbd>: will undo the last cell edit(s).
- <kbd>Ctrl</kbd>+<kbd>Y</kbd> / <kbd>Command</kbd>+<kbd>Y</kbd>: will redo the last undo.

Note that the grid needs focus for these shortcuts to have an effect.

## Undo / Redo API

It is also possible to programmatically control undo / redo and check the number of currently available undo / redo actions. These API methods are listed below:

<api-documentation source='grid-api/api.json' section='UndoRedo'></api-documentation>

## Undo / Redo Events

The following events are relevant to undo / redo:

<api-documentation source='grid-events/events.json' section='editing' names='["undoStart", "undoEnd", "redoStart", "redoEnd", "cellValueChanged"]'></api-documentation>

For an undo / redo, the events will be fired as:

1. One `undoStart` / `redoStart` event.
1. Zero to many `cellValueChanged` events.
1. One `undoEnd` / `redoEnd` event.

When there are no undo / redo operations to perform, the start and end events will still fire. However, the end event will have a value of `false` for the `operationPerformed` property (compared to `true` when an operation was performed).

If the application is doing work each time it receives a `cellValueChanged` event, you can use the `undoStart` / `redoStart` and `undoEnd` / `redoEnd` events to suspend the application's work and then do the work for all cells impacted by the undo / redo operation afterwards.

If [Read Only Edit](/value-setters/#read-only-edit) is enabled, undo / redo will not perform any operations. The start and end events will still fire, which means that you can implement your own undo / redo by keeping track of the `cellEditRequest` events.

## Example: Undo / Redo

The example below has the following grid options enabled to demonstrate undo / redo:

<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    defaultColDef: {
|        // makes all cells editable
|        editable: true
|    },
|    // allows copy / paste using cell ranges
|    enableRangeSelection: true,
|
|    // enables the fill handle
|    enableFillHandle: true,
|
|    // enables undo / redo
|    undoRedoCellEditing: true,
|
|    // restricts the number of undo / redo steps to 5
|    undoRedoCellEditingLimit: 5,
|
|    // enables flashing to help see cell changes
|    enableCellChangeFlash: true,
|}
</snippet>

To see undo / redo in action, try the following:

- **Cell Editing**: click and edit some cell values.
- **Fill Handle**: drag the fill handle to change a range of cells.
- **Copy / Paste**: use <kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>Ctrl</kbd>+<kbd>V</kbd> to copy and paste a range of cells.
- **Undo Shortcut**: use <kbd>Ctrl</kbd>+<kbd>Z</kbd> to undo the cell edits.
- **Redo Shortcut**: use <kbd>Ctrl</kbd>+<kbd>Y</kbd> to redo the undone cell edits.
- **Undo API**: use the 'Undo' button to invoke `gridApi.undoCellEditing()`.
- **Redo API**: use the 'Redo' button to invoke `gridApi.redoCellEditing()`.
- **Undo / Redo Limit**: only 5 actions are allowed as `undoRedoCellEditingLimit=5`.

<grid-example title='Undo / Redo' name='undo-redo' type='generated' options='{ "enterprise": true, "exampleHeight": 530, "modules": ["clientside", "range", "clipboard"] }'></grid-example>

## Complex Objects

If your cell values contain complex objects, there are a few steps necessary for undo / redo to work.

For manual editing, a [Value Parser](/value-parsers/) is required to convert string values back into complex objects.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'a',
            editable: true,
            valueParser: params => {
                // convert `params.newValue` string value into complex object
                return {
                    actualValue: params.newValue,
                    anotherProperty: params.data.anotherProperty,
                }
            }
        }
    ]
}
</snippet>

If a [Value Getter](/value-getters/) is being used to create complex objects, a [Value Setter](/value-setters/) must be used to update the data. `colDef.equals` is also needed when [Comparing Values](/change-detection/#comparing-values) to determine if the cell value has changed for rendering.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'a',
            editable: true,
            valueGetter: params => {
                // create complex object from data
                return {
                    actualValue: params.data[params.colDef.field],
                    anotherProperty: params.data.anotherProperty,
                }
            },
            valueSetter: params => {
                // update data from complex object
                params.data[params.colDef.field] = params.newValue.actualValue
                return true
            },
            equals: (valueA, valueB) => {
                // compare complex objects
                return valueA.actualValue === valueB.actualValue
            }
        }
    ]
}
</snippet>

Complex object cell values must be immutable. If the cell values are mutated, undo / redo will not be able to restore the original values. This means that the Value Parser must return a new complex object.

When using a [Fill Handle](/range-selection-fill-handle/) with a horizontal fill direction and your columns do not all have same complex object type, you will need to implement a [Custom User Function](/range-selection-fill-handle/#custom-user-function). Note that the fill values provided to the function could be complex objects from any column, which you will need to handle.

[Clipboard](/clipboard/) operations (copy/paste) use string values, so complex objects require [Processing Pasted Data](/clipboard/#processing-pasted-data) to convert between complex objects and strings.

The following example demonstrates how to use complex objects with undo / redo.
- For column **A**:
    - A Value Getter is used to create complex objects from the data.
    - The complex objects have a `toString` property used for rendering.
    - A Value Setter is used to update the data from the complex objects (the inverse of the Value Getter).
    - A Value Parser is used to convert the string values produced from cell editing into complex objects (the inverse of the `toString` method).
    - A Column Definition `equals` function is provided to compare the complex objects (without this the grid would use reference equality, but this won't work here as the Value Getter returns a new object each time).
- For column **B**:
    - The column values are complex objects.
    - A [Value Formatter](/value-formatters/) is used to convert the complex objects into strings for rendering.
    - A Value Parser is used to convert the string values produced from cell editing into complex objects (the inverse of the Value Formatter).
    - [Dynamic Parameters](/cell-editors/#dynamic-parameters) are provided to the cell editor to display a string value when you edit the cell (column **A** didn't need this as it has a `toString` property).
- For all columns:
    - `fillHandleDirection = 'y'` which prevents the Fill Handle from being used to drag values between the columns, as they have different complex object formats.
    - `processCellForClipboard` is implemented, which converts complex object values into strings when copying cell values.
    - `processCellFromClipboard` is implemented, which converts string values into complex objects when pasting cell values.
- Try the following actions:
    - **Cell Editing**: click and edit some cell values.
    - **Fill Handle**: drag the fill handle to change a range of cells.
    - **Copy / Paste**: use <kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>Ctrl</kbd>+<kbd>V</kbd> to copy and paste a range of cells.
    - **Undo Shortcut**: use <kbd>Ctrl</kbd>+<kbd>Z</kbd> to undo the cell edits.
    - **Redo Shortcut**: use <kbd>Ctrl</kbd>+<kbd>Y</kbd> to redo the undone cell edits.
    - **Undo API**: use the 'Undo' button to invoke `gridApi.undoCellEditing()`.
    - **Redo API**: use the 'Redo' button to invoke `gridApi.redoCellEditing()`.
    - **Undo / Redo Limit**: only 5 actions are allowed as `undoRedoCellEditingLimit=5`.


<grid-example title='Undo / Redo with Complex Objects' name='undo-redo-complex-objects' type='generated' options='{ "enterprise": true, "exampleHeight": 530, "modules": ["clientside", "range", "clipboard"] }'></grid-example>
