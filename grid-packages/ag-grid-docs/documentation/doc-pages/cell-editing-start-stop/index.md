---
title: "Start / Stop Cell Editing"
---

This page discusses the different ways in which Cell Editing can be started and stopped.

## Start Editing

Assuming `editable=true` or `editable` has a callback that returns `true` for the Column Definition, editing will start upon any of the following:

- **Edit Key Pressed**: One of the following is pressed: <kbd>Enter</kbd>, <kbd>F2</kbd>. If this happens then `params.key` will contain the key code of the key that started the edit.
- **Backspace**: The default editor will start and clear the contents of the cell if <kbd>Backspace</kbd> is pressed on Windows. To mimic this behaviour on MacOS, use the `enableCellEditingOnBackspace=true` grid option.
- **Printable Key Pressed**: Any of the following characters are pressed: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!"£$%^&amp;*()_+-=[];\'#,./\|<>?:@~{}`<br/> If this happens then `params.charPress` will contain the character that started the edit. The default editor places this character into the edit field so that the user experience is they are typing into the cell.
- **Mouse Double Click**: If the mouse is double-clicked. There is a grid property `singleClickEdit` that will allow single-click to start editing instead of double-click. Another property `suppressClickEdit` will prevent both single-click and double-click from starting the edit; use this if you only want to have your own way of starting editing, such as clicking a button in your custom cell renderer.
- **api.startEditingCell(params)**: If you call `startEditingCell(params)` on the grid API

## Stop Editing

The grid will stop editing when any of the following happen:

- **Callback stopEditing**: The callback `stopEditing` (from the params above) gets called by the editor. This is how your cell editor informs the grid to stop editing.
- **Other Cell Focus**: If focus in the grid goes to another cell, the editing will stop.
- **Enter Key Down**: If the grid receives an <kbd>Enter</kbd> key press event on the cell. If you do **not** want to stop editing when <kbd>Enter</kbd> is pressed, then listen for the event and stop propagation so the grid does not act on the event.
- **Escape Key Down**: Similar to <kbd>Enter</kbd>, if <kbd>Esc</kbd> key is pressed, editing will stop. Unlike <kbd>Enter</kbd>, the <kbd>Esc</kbd> action will discard changes rather than taking the new value.
- **Tab Key Down**: Editing will stop, accepting changes, and editing will move to the next cell, or the previous cell if <kbd>Shift</kbd> is also pressed.
- **Popup Editor Closed**: If using popup editor, the popup is configured to close if you click outside the editor. Closing the popup triggers the grid to stop editing.
- **gridApi.stopEditing()**: If you call `stopEditing()` on the grid API.


## Tab Navigation

While editing, if you hit <kbd>Tab</kbd>, the editing will stop for the current cell and start on the next cell. If you hold down <kbd>Shift</kbd>+<kbd>Tab</kbd>, the same will happen except the previous cell will start editing rather than the next. This is in line with editing data in Excel.

The next and previous cells can also be navigated using the API functions `api.tabToNextCell()` and `api.tabToPreviousCell()`. Both of these methods will return `true` if the navigation was successful, otherwise `false`.

<api-documentation source='grid-api/api.json' section='navigation' names='["tabToNextCell", "tabToPreviousCell"]'></api-documentation>


## Editing API

The grid has the following API methods for editing:

<api-documentation source='grid-api/api.json' section='editing' names='["startEditingCell", "stopEditing", "getEditingCells"]'></api-documentation>

If the grid is editing, `getEditingCells()` returns back details of the editing cell(s). The result is an array of objects. If only one cell is editing (the default) then the array will have one entry. If multiple cells are editing (e.g. [Full Row Edit](#full-row-editing)) then the array contains all editing cells.

Below is a code example of using the editing API methods.

<snippet>
|// start editing country cell on first row
|gridOptions.api.startEditingCell({
|    rowIndex: 0,
|    colKey: 'country'
|});
|
|// stop editing
|gridOptions.api.stopEditing();
|
|// print details of editing cell
|const cellDefs = gridOptions.api.getEditingCells();
|cellDefs.forEach(cellDef => {
|    console.log(cellDef.rowIndex);
|    console.log(cellDef.column.getId());
|    console.log(cellDef.floating);
|});
</snippet>

The example below illustrates different parts of the editing API. Each button starts editing the 'Last Name' column of the first row with the following differences:

- `edit()`: Normal editing start.
- `edit(Backspace)`: Edit as if delete button was pressed (clears contents first).
- `edit('T')`: Edit as if 'T' was pressed (places 'T' into cell).
- `edit(top)`: Edits top pinned row.
- `edit(bottom)`: Edits bottom pinned row.

The example also demonstrates the following buttons for edit navigation:

- `stop()`: Stops editing.
- `next()`: Edits the next cell.
- `previous()`: Edits the previous cell.

Finally, the example also demonstrates querying which cell is editing:

- `which()`: If the grid is editing, prints to the console which cell is in edit mode.

<grid-example title='Cell Editing' name='cell-editing' type='generated' options='{ "exampleHeight": 545 }'></grid-example>

## Enter Key Navigation

By default pressing <kbd>Enter</kbd> will start editing on a cell, or stop editing on an editing cell. It will not navigate to the cell below.

To allow consistency with Excel the grid has the following properties:

- `enterMovesDown`: Set to `true` to have <kbd>Enter</kbd> key move focus to the cell below if not editing. The default is <kbd>Enter</kbd> key starts editing the currently focused cell.
- `enterMovesDownAfterEdit:` Set to `true` to have <kbd>Enter</kbd> key move focus to the cell below after <kbd>Enter</kbd> is pressed while editing. The default is editing will stop and focus will remain on the editing cell.

The example below demonstrates the focus moving down when <kbd>Enter</kbd> is pressed.

<grid-example title='Enter Key Navigation' name='enter-key-navigation' type='generated' options='{ "exampleHeight": 555 }'></grid-example>

## Single-Click Editing

The default is for the grid to enter editing when you Double-Click on a cell. To change the default so that a single-click starts editing, set the property `gridOptions.singleClickEdit = true`. This is useful when you want a cell to enter edit mode as soon as you click on it, similar to the experience you get when inside Excel.

It is also possible to define single-click editing on a per-column basis using `colDef.singleClickEdit = true`.

The grid below has `singleClickEdit = true` so that editing will start on a cell when you single-click on it.

<grid-example title='Single Click Editing' name='single-click-editing' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

## No-Click Editing

It is possible to configure the grid so neither Single-Click or Double-Click starts editing. To do this set the property `suppressClickEdit=true`. This is useful when you want to start the editing in another way, such as including a button in your cell renderer.

The grid below has `suppressClickEdit = true` so that clicking doesn't started editing. The grid configures a Cell Renderer with a button to start editing.

<grid-example title='No Click Editing' name='single-click-editing-renderer' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

## Stop Editing When Grid Loses Focus

By default, the grid will not stop editing the currently editing cell when the cell loses focus, unless another
cell is clicked on. This means clicking on the grid header, or another part of your application, will not stop editing.
This can be bad if, for example, you have a save button, and you need the grid to stop editing before you execute 
your save function (e.g. you want to make sure the edit is saved into the grid's state).

If you want the grid to stop editing when focus leaves the cell or the grid, set the grid property 
`stopEditingWhenCellsLoseFocus = true`.

The example below shows the editing with `stopEditingWhenCellsLoseFocus = true`. Notice the following:

- Double-click to start editing 'Age', then click outside the grid (on the 'Dummy Save' button, or the dummy text field) and the grid will stop editing.
- Double-click to start editing 'Year', a custom popup editor appears, you can click anywhere on the popup editor, but once you click outside the editor, the popup closes.

<grid-example title='Stop Editing When Cells Loses Focus' name='stop-edit-when-grid-loses-focus' type='generated' options='{ "exampleHeight": 510 }'></grid-example>

[[note]]
| Cell Editing can also be performed via Cell Editor Components; please see [Cell Editor Components](/component-cell-editor/) for more information.
