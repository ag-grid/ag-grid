---
title: "Full Row Editing"
---

Full row editing is for when you want all cells in the row to become editable at the same time. This gives the impression to the user that the record the row represents is being edited.

To enable full row editing, set the grid option `editType = 'fullRow'`.

If using custom cell editors, the cell editors will work in the exact same way with the following additions:

- `focusIn`: If your cell editor has a `focusIn()` method, it will get called when the user tabs into the cell. This should be used to put the focus on the particular item to be focused, e.g. the `textfield` within your cell editor.
- `focusOut`: If your cell editor has a `focusOut()` method, it will get called when the user tabs out of the cell. There is no intended use for this; it's just there to complement the `focusIn()` method.
- Events: When a row stops editing, the `cellValueChanged` event gets called for each column and `rowValueChanged` gets called once for the row.

### Full Row Edit and Popup Editors

Full row editing is not compatible with popup editors. This is because a) the grid would look confusing to pop up an editor for each cell in the row at the same time and b) the complexity of navigation and popup is almost impossible to model, so the grid and your application code would be messy and very error prone. If you are using full row edit, then you are prevented from using popup editors.

This does not mean that you cannot show a popup from your 'in cell' editor - you are free to do that - however the responsibility of showing and hiding the popup belongs with your editor. You may want to use the grid's focus events to hide the popups when the user tabs or clicks out of the cell.

### Example: Full Row Edit

The example below shows full row editing. In addition to standard full row editing, the following should also be noted:

- The 'Price' column has a custom editor demonstrating how you should implement the `focusIn()` method.
  Both `focusIn()` and `focusOut()` for this editor are logged to the console. Note that `focusIn()`
  and `focusOut()` are only called when the user is tabbing between cells when editing, they are not called
  as the user double clicks on a cell to start editing that cell, or the user finishes editing that cell by
  e.g. hitting the <kbd>Enter</kbd> key.
- Pressing <kbd>Tab</kbd> / <kbd>Shift</kbd> & <kbd>Tab</kbd> while editing will move the focus between the cells on the editing row. Read only cells will be focusable while the row is in edit mode.
- The 'Suppress Navigable' column is not navigable using <kbd>Tab</kbd> / <kbd>Shift</kbd> & <kbd>Tab</kbd>. In other words, when tabbing around the grid, you cannot tab onto this cell.
- The **Read Only** column is not editable, so when the row goes into edit mode, the cell in the **Read Only** column cannot be edited.
- The button will start editing line two. It uses the API to start editing a cell, however the result is that the whole row will become editable starting with the specified cell.
- `cellValueChanged` and `rowValueChanged` events are logged to console.

<grid-example title='Full Row Editing' name='full-row-editing' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"], "exampleHeight": 527 }'></grid-example>
