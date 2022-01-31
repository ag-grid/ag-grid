---
title: "Cell Editing"
---

This section outlines how to configure cell editors to enable editing in cells.

You configure cell editors as part of the column definition and can be one of the following:

- `undefined`: The grid uses the default text cell editor.
- `string`: The name of a cell renderer registered with the grid.
- `Class`: Provide your own cell renderer component directly without registering.

## Enabling editing in a column

The simplest way to enable editing is by providing `colDef.editable=true`. By doing so, all the cells in the column will be editable.

It is possible to have only a few cells in a column editable; to do so, instead of `colDef.editable=true`, you can specify a callback that will get called for each cell displayed for that column. If you return `true` the cell will be editable.

<api-documentation source='column-properties/properties.json' section='editing' names='["editable"]' ></api-documentation>

## Default Editing

To get simple string editing, you do not need to provide an editor. The grid by default allows simple string editing on cells. The default editor is used if you do not provide a cell editor.

## Start Editing

If you have `colDef.editable=true` set for a column, editing will start upon any of the following:

- **Edit Key Pressed**: One of the following is pressed: <kbd>Enter</kbd>, <kbd>F2</kbd>, <kbd>Backspace</kbd>, <kbd>Delete</kbd>. If this happens then `params.key` will contain the key code of the key that started the edit. The default editor will clear the contents of the cell if <kbd>Backspace</kbd> or <kbd>Delete</kbd> are pressed.
- **Printable Key Pressed**: Any of the following characters are pressed: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!"£$%^&amp;*()_+-=[];\'#,./\|<>?:@~{}`<br/> If this happens then `params.charPress` will contain the character that started the edit. The default editor places this character into the edit field so that the user experience is they are typing into the cell.
- **Mouse Double Click**: If the mouse is double-clicked. There is a grid property `singleClickEdit` that will allow single-click to start editing instead of double-click. Another property `suppressClickEdit` will prevent both single-click and double-click from starting the edit; use this if you only want to have your own way of starting editing, such as clicking a button in your custom cell renderer.
- **api.startEditingCell(params)**: If you call `startEditingCell(params)` on the grid API

## Stop / End Editing

The grid will stop editing when any of the following happen:

- **Callback stopEditing**: The callback `stopEditing` (from the params above) gets called by the editor. This is how your cell editor informs the grid to stop editing.
- **Other Cell Focus**: If focus in the grid goes to another cell, the editing will stop.
- **Enter Key Down**: If the grid receives an <kbd>Enter</kbd> key press event on the cell. If you do **not** want to stop editing when <kbd>Enter</kbd> is pressed, then listen for the event and stop propagation so the grid does not act on the event.
- **Escape Key Down**: Similar to <kbd>Enter</kbd>, if <kbd>Esc</kbd> key is pressed, editing will stop. Unlike <kbd>Enter</kbd>, the <kbd>Esc</kbd> action will discard changes rather than taking the new value.
- **Tab Key Down**: Editing will stop, accepting changes, and editing will move to the next cell, or the previous cell if <kbd>Shift</kbd> is also pressed.
- **Popup Editor Closed**: If using popup editor, the popup is configured to close if you click outside the editor. Closing the popup triggers the grid to stop editing.
- **gridApi.stopEditing()**: If you call `stopEditing()` on the grid API.

## Popup vs In Cell

An editor can be in a popup or in cell.

### In Cell

In Cell editing means the contents of the cell will be cleared and the editor will appear inside the cell. The editor will be constrained to the boundaries of the cell, so if it is larger than the provided area it will be clipped. When editing is finished, the editor will be removed and the renderer will be placed back inside the cell again.

### Popup

If you want your editor to appear in a popup (such as a dropdown list), then you can have it appear in a popup. The popup will behave like a menu in that any mouse interaction outside of the popup will close the popup. The popup will appear over the cell, however it will not change the contents of the cell. Behind the popup the cell will remain intact until after editing is finished which will result in the cell being refreshed.

From a lifecycle and behaviour point of view, 'in cell' and 'popup' have no impact on the editor. You can create a cell editor and change this property and observe how your editor behaves in each way.

To have an editor appear in a popup, have the `isPopup()` method return `true`. If you want editing to be done within a cell, either return `false` or don't provide this method at all.

## Tab Navigation

While editing, if you hit <kbd>Tab</kbd>, the editing will stop for the current cell and start on the next cell. If you hold down <kbd>Shift</kbd>+<kbd>Tab</kbd>, the same will happen except the previous cell will start editing rather than the next. This is in line with editing data in Excel.

The next and previous cells can also be navigated using the API functions `api.tabToNextCell()` and `api.tabToPreviousCell()`. Both of these methods will return `true` if the navigation was successful, otherwise `false`.

<api-documentation source='grid-api/api.json' section='navigation' names='["tabToNextCell", "tabToPreviousCell"]'></api-documentation>

## Value Parser and Value Setter

[Value setters](/value-setters/) and [value parsers](/value-parsers/) are the inverse of value getters and formatters. If you want to parse the data, or set the value into your data in ways other than just using the field, see the sections for [value setters](/value-setters/) and [value parsers](/value-parsers/).

## Event: Cell Value Changed

After a cell has been changed with default editing (i.e. not your own custom cell renderer) the `cellValueChanged` event is fired. You can listen for this event in the normal way, or additionally you can add a `onCellValueChanged()` callback to the `colDef`. This is used if your application needs to do something after a value has been changed.

<api-documentation source='grid-events/events.json' section='editing' names='["cellValueChanged"]' config='{"overrideBottomMargin":"0rem"}'></api-documentation>
<api-documentation source='column-properties/properties.json' section='events' names='["onCellValueChanged"]'></api-documentation>

The `cellValueChanged` event contains the same parameters as the `ValueSetter` with one difference: the `newValue`. If `field` is in the column definition, the `newValue` contains the value in the data after the edit. So for example, if the `onCellValueChanged` converts the provided string value into a number, then `newValue` for `ValueSetter` will have the string, and `newValue` for `onCellValueChanged` will have the number.

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

## Start / Stop Editing Events

The following events are fired as editing starts and stops:

- `cellEditingStarted`: editing has started on a cell.
- `cellEditingStopped`: editing has stopped on a cell.
- `rowEditingStarted`: editing has started on a row. Only for full row editing.
- `rowEditingStopped`: editing has stopped on a row. Only for full row editing.

## Example: Cell Editing Api

The example below illustrates different parts of the editing API. Each button starts editing the 'Last Name' column of the first row with the following differences:

- `edit()`: Normal editing start.
- `edit(Delete)`: Edit as if delete button was pressed (clears contents first).
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

## Many Editors One Column

It is also possible to use different editors for different rows in the same column. To configure this set `colDef.cellEditorSelector` to a function that returns alternative values for `cellEditor` and `cellEditorParams`.

The `params` passed to `cellEditorSelector` are the same as those passed to the (Cell Editor Component)[../component-cell-editor/]. Typically the selector will use this to check the rows contents and choose an editor accordingly.

The result is an object with `component` and `params` to use instead of `cellEditor` and `cellEditorParams`.

This following shows the Selector always returning back an AG Rich Select Cell Editor:

```js
cellEditorSelector: params => {
    return {
        component: 'agRichSelect',
        params: { values: ['Male', 'Female'] }
    };
}
```

However a selector only makes sense when a selection is made. The following demonstrates selecting between Cell Editors:

```js
cellEditorSelector: params => {

    const type = params.data.type;

    if (params.data.type === 'age') {
        return { comp: NumericCellEditor };
    }

    if (params.data.type === 'gender') {
        return {
            component: 'agRichSelect',
            params: { values: ['Male', 'Female'] }
        };
    }

    if (params.data.type === 'mood') {
        return { component: MoodEditor };
    }

    return undefined;
}
```

Here is a full example:

- The column 'Value' holds data of different types as shown in the column 'Type' (numbers/genders/moods).
- `colDef.cellEditorSelector` is a function that returns the name of the component to use to edit based on the type of data for that row
- Edit a cell by double clicking to observe the different editors used. 

<grid-example title='Dynamic Editor Component' name='dynamic-editor-component' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel", "richselect"], "exampleHeight": 450, "includeNgFormsModule" : true }'></grid-example>

## Dynamic Parameters

Parameters for cell editors can be dynamic to allow different selections based on what cell is being edited. For example, you might have a 'City' column that has values based on the 'Country' column. To do this, provide a function that returns parameters for the property `cellEditorParams`.

```js
cellEditorParams: params => {
    const selectedCountry = params.data.country;

    if (selectedCountry === 'Ireland') {
        return {
            values: ['Dublin', 'Cork', 'Galway']
        };
    } else {
        return {
            values: ['New York', 'Los Angeles', 'Chicago', 'Houston']
        };
    }
}
```

## Example: Rich Cell Editor / Dynamic Parameters

Below shows an example with dynamic editor parameters. The following can be noted:

- Column **Gender** uses a cell renderer for both the grid and the editor.
- Column **Country** allows country selection, with `cellHeight` being used to make each entry 50px tall. If the currently selected city for the row doesn't match a newly selected country, the city cell is cleared.
- Column **City** uses dynamic parameters to display values for the selected country, and uses `formatValue` to add the selected city's country as a suffix.
- Column **Address** uses the large text area editor.

<grid-example title='Dynamic Parameters' name='dynamic-parameters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect", "menu", "columnpanel"], "exampleHeight": 520 }'></grid-example>

## Enter Key Navigation

By default pressing <kbd>Enter</kbd> will start editing on a cell, or stop editing on an editing cell. It will not navigate to the cell below.

To allow consistency with Excel the grid has the following properties:

- `enterMovesDown`: Set to `true` to have <kbd>Enter</kbd> key move focus to the cell below if not editing. The default is <kbd>Enter</kbd> key starts editing the currently focused cell.
- `enterMovesDownAfterEdit:` Set to `true` to have <kbd>Enter</kbd> key move focus to the cell below after <kbd>Enter</kbd> is pressed while editing. The default is editing will stop and focus will remain on the editing cell.

The example below demonstrates the focus moving down when <kbd>Enter</kbd> is pressed.

<grid-example title='Enter Key Navigation' name='enter-key-navigation' type='generated' options='{ "exampleHeight": 555 }'></grid-example>

## Example: Datepicker Cell Editing

The example below illustrates:

- 'Date' column uses a Component cell editor that allows you to pick a date using jQuery UI Datepicker.

<grid-example title='Datepicker Cell Editing' name='datepicker-cell-editing' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"], "extras": ["jquery", "jqueryui", "bootstrap"] }'></grid-example>

## Full Row Editing

Full row editing is for when you want all cells in the row to become editable at the same time. This gives the impression to the user that the record the row represents is being edited.

To enable full row editing, set the grid option `editType = 'fullRow'`.

If using custom cell editors, the cell editors will work in the exact same way with the following additions:

- `focusIn`: If your cell editor has a `focusIn()` method, it will get called when the user tabs into the cell. This should be used to put the focus on the particular item to be focused, e.g. the `textfield` within your cell editor.
- `focusOut`: If your cell editor has a `focusOut()` method, it will get called when the user tabs out of the cell. No intended use for this, is just there to complement the `focusIn()` method.
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
- The 'Not Editable' column is not editable, so when the row goes into edit mode, this column is not impacted.
- The button will start editing line two. It uses the API to start editing a cell, however the result is that the whole row will become editable starting with the specified cell.
- `cellValueChanged` and `rowValueChanged` events are logged to console.

<grid-example title='Full Row Editing' name='full-row-editing' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"], "exampleHeight": 527 }'></grid-example>

## Single Click, Double Click, No Click Editing

### Double-Click Editing

The default is for the grid to enter editing when you double-click on a cell.

### Single-Click Editing

To change the default so that a single-click starts editing, set the property `gridOptions.singleClickEdit = true`. This is useful when you want a cell to enter edit mode as soon as you click on it, similar to the experience you get when inside Excel.

It is also possible to define single-click editing on a per-column basis using `colDef.singleClickEdit = true`.

### No-Click Editing

To change the default so that neither single- nor double-click starts editing, set the property `suppressClickEdit = true`. This is useful when you want to start the editing in another way, such as including a button in your cell renderer.

The grid below has `singleClickEdit = true` so that editing will start on a cell when you single-click on it.

<grid-example title='Single Click Editing' name='single-click-editing' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

The grid below has `suppressClickEdit = true` so that clicking doesn't started editing. The grid configures a cellRenderer with a button to start editing.

<grid-example title='No Click Editing' name='single-click-editing-renderer' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

### Stop Editing When Grid Loses Focus

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
