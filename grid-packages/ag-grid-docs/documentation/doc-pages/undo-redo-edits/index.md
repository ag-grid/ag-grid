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
- **Undo API**: use the 'Undo' button to invoke `gridApi.undoCellEditing().`
- **Redo API**: use the 'Redo' button to invoke `gridApi.redoCellEditing().`
- **Undo / Redo Limit**: only 5 actions are allowed as `undoRedoCellEditingLimit=5`.

<grid-example title='Undo / Redo' name='undo-redo' type='generated' options='{ "enterprise": true, "exampleHeight": 530, "modules": ["clientside", "range", "clipboard"] }'></grid-example>
