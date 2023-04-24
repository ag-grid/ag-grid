---
title: "Cell Editors"
---

Create your own cell editor by providing a cell editor component.

## Simple Cell Editor

md-include:simple-editor-javascript.md
md-include:simple-editor-angular.md
md-include:simple-editor-react.md
md-include:simple-editor-vue.md

## Simple Cell Editor Example

The example below shows a few simple cell editors in action.

- The `Doubling` Cell Editor will double a given input and reject values over a 1000
- The `Mood` Cell Editor illustrates a slightly more complicated editor with values changed depending on the smiley chosen
- The `Numeric` Cell Editor illustrates a slightly more complicated numeric editor to the `Doubling` editor above, with
increased input validation

<grid-example title='Simple Editor Components' name='component-editor' type='mixed' options='{ "exampleHeight": 370, "includeNgFormsModule" : true }'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<interface-documentation interfaceName='ICellEditorParams' config='{"hideHeader":false, "headerLevel": 3}'></interface-documentation>

md-include:params_vue.md

## Registering Cell Editors with Columns

See the section [registering custom components](/components/#registering-custom-components) for details on registering and using custom cell editors.

## Complementing Cell Editor Params

As with cell renderers, cell editors can also be provided with additional parameters. Do this using `cellEditorParams` as in the following example which will pass 'Ireland' as the 'country' parameter:

md-include:complementing-component-javascript.md
md-include:complementing-component-angular.md
md-include:complementing-component-react.md
md-include:complementing-component-vue.md


## Configure Popup

[[only-react]]
|Configure that an Editor is in a popup by setting `cellEditorPopup=true` on the [Column Definition](/column-definitions/).

[[only-javascript-or-angular-or-vue]]
|Configure that a Custom Cell Editor is in a popup in one of the following ways:
|1. Implement the `isPopup()` method on the Custom Cell Editor and return `true`.
|1. Specify `cellEditorPopup=true` on the [Column Definition](/column-definitions/).

```js
 colDef = {
    cellEditorPopup: true,
    // ...other props
}
```

## Configure Popup Position

By default Popup Editors appear over the editing Cell. It is also possible to have the Cell Editor appear below the Cell, so the user can see the Cell contents while editing.

[[only-react]]
|Configure the Popup Editor to appear below the Cell by setting `cellEditorPopupPosition='under'` on the [Column Definition](/column-definitions/).

[[only-javascript-or-angular-or-vue]]
|Configure the Popup Editor to appear below the Cell in one of the following ways:
|1. Implement the `getPopupPosition()` method on the Custom Cell Editor and return `under`.
|1. Specify `cellEditorPopupPosition='under'` on the [Column Definition](/column-definitions/).

```js
 colDef = {
    cellEditorPopupPosition: 'under',
    // ...other props
}
```


## Keyboard Navigation While Editing

If you provide a cell editor, you may wish to disable some of the grids keyboard navigation. For example, if you are providing a simple text editor, you may wish the grid to do nothing when you press the right and left arrows (the default is the grid will move to the next / previous cell) as you may want the right and left arrows to move the cursor inside your editor. In other cell editors, you may wish the grid to behave as normal.

Because different cell editors will have different requirements on what the grid does, it is up to the cell editor to decide which event it wants the grid to handle and which it does not.

You have two options to stop the grid from doing it's default action on certain key events:

1. Stop propagation of the event to the grid in the cell editor.
1. Tell the grid to do nothing via the `colDef.suppressKeyEvent()` callback.

### Option 1 - Stop Propagation

If you don't want the grid to act on an event, call `event.stopPropagation()`. The advantage of this method is that your cell editor takes care of everything, good for creating reusable cell editors.

The follow code snippet is one you could include for a simple text editor, which would stop the grid from doing navigation.

md-include:keyboard-option-1-javascript.md
md-include:keyboard-option-1-angular.md
md-include:keyboard-option-1-react.md
md-include:keyboard-option-1-vue.md

### Option 2 - Suppress Keyboard Event

If you implement `colDef.suppressKeyboardEvent()`, you can tell the grid which events you want process and which not. The advantage of this method of the previous method is it takes the responsibility out of the cell editor and into the column definition. So if you are using a reusable, or third party, cell editor, and the editor doesn't have this logic in it, you can add the logic via configuration.

<api-documentation source='column-properties/properties.json' section='columns' names='["suppressKeyboardEvent"]'></api-documentation>

md-include:keyboard-option-2-javascript.md
md-include:keyboard-option-2-angular.md
md-include:keyboard-option-2-react.md
md-include:keyboard-option-2-vue.md


## Cell Editing Example

The example below illustrates:

- 'Gender' column uses a Component cell editor that allows choices via a 'richSelect' (AG Grid Enterprise only), with values supplied by complementing the editor parameters.
- 'Age' column uses a Component cell editor that allows simple integer input only.
- 'Mood' column uses a custom Component cell editor and renderer that allows choice of mood based on image selection.
- 'Address' column uses a Component cell editor that allows input of multiline text via a 'largeText'. <kbd>Tab</kbd> and <kbd>Esc</kbd> (amongst others) will exit editing in this field, <kbd>Shift</kbd>+<kbd>Enter</kbd> will allow newlines.
- 'Country' columns shows using 'richSelect' for a complex object - the cell renderer takes care of only rendering the country name.

<grid-example title='Simple Editor Components' name='component-editor-2' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "richselect"], "exampleHeight": 370, "includeNgFormsModule" : true }'></grid-example>

## Accessing Cell Editor Instances

After the grid has created an instance of a cell editor for a cell it is possible to access that instance. This is useful if you want to call a method that you provide on the cell editor that has nothing to do with the operation of the grid. Accessing cell editors is done using the grid API `getCellEditorInstances(params)`.

<api-documentation source='grid-api/api.json' section='editing' names='["getCellEditorInstances"]'></api-documentation>

If you are doing normal editing, then only one cell is editable at any given time. For this reason if you call `getCellEditorInstances()` with no params, it will return back the editing cell's editor if a cell is editing, or an empty list if no cell is editing.

An example of calling `getCellEditorInstances()` is as follows:

```js
const instances = gridOptions.api.getCellEditorInstances(params);
if (instances.length > 0) {
    const instance = instances[0];
}
```

The example below shows using `getCellEditorInstances`. The following can be noted:

- All cells are editable.
- **First Name** and **Last Name** use the default editor.
- All other columns use the provided `MySimpleCellEditor` editor.
- The example sets an interval to print information from the active cell editor. There are three results: 1) No editing 2) Editing with default cell renderer and 3) editing with the custom cell editor. All results are printed to the developer console.

<grid-example title='Get Editor Instance' name='get-editor-instance' type='mixed' options='{ }'></grid-example>
