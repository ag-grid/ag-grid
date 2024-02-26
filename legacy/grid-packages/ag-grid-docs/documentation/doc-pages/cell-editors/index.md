---
title: "Edit Components"
---

A Cell Editor Component is the UI that appears, normally inside the Cell, that takes care of the Edit operation. You can select from the [Provided Cell Editors](/provided-cell-editors/) or create your own [Custom Cell Editor Components](/cell-editors/).

The example below shows some Custom Editor Components.

**NOTE - example needs to change and show: a) editing using provided editors and 2) editing with some simple custom editors, eg simple text editor (similar to provided) and happy / sad editor. Using head names sush as "Provided Text" and "Custom Numeric" would allow not having bullet points before example. The example use cases of doubling numbers is stupid.**

- The `Doubling` Cell Editor will double a given input and reject values over a 1000
- The `Mood` Cell Editor illustrates a slightly more complicated editor with values changed depending on the smiley chosen
- The `Numeric` Cell Editor illustrates a slightly more complicated numeric editor to the `Doubling` editor, with increased input validation

<grid-example title='Simple Editor Components' name='component-editor' type='mixed' options='{ "exampleHeight": 370, "includeNgFormsModule" : true }'></grid-example>

## Custom Components

md-include:component-interface-javascript.md 
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='ICellEditorParams' config='{"description": ""}'></interface-documentation>
</framework-specific-section>

md-include:params_vue.md       

## Selecting Components

Cell Editor Components are configured using the `cellEditor` property of the [Column Definition](/column-definitions/).

<snippet>
const gridOptions = {
    columnDefs: [
        { 
            field: 'name', 
            editable: true, 
            // uses a provided editor, referenced by name
            cellEditor: 'agTextCellEditor' 
        },
        { 
            field: 'name', 
            editable: true, 
            // uses a custom editor, referenced directly
            cellEditor: CustomEditorComp
        },
    ]
}
</snippet>

See [Registering Custom Components](/components/#registering-custom-components) to optionally register components and refernce them by name.

## Dynamic Selection

The `colDef.cellRendererSelector` function allows setting difference Editor Components for different Rows within a Column.

The `params` passed to `cellEditorSelector` are the same as those passed to the Editor Component. Typically the selector will use this to check the rows contents and choose an editor accordingly.

The result is an object with `component` and `params` to use instead of `cellEditor` and `cellEditorParams`.

This following shows the Selector always returning back the provided Rich Select Editor:

```js
cellEditorSelector: params => {
    return {
        component: 'agRichSelectCellEditor',
        params: { values: ['Male', 'Female'] }
    };
}
```

However a selector only makes sense when a selection is made. The following demonstrates selecting between Cell Editors:

```js
cellEditorSelector: params => {

  if (params.data.type === 'age') {
    return {
      component: NumericCellEditor,
    }
  }

  if (params.data.type === 'gender') {
    return {
      component: 'agRichSelectCellEditor',
      params: {
        values: ['Male', 'Female']
      }
    }
  }

  if (params.data.type === 'mood') {
    return {
      component: MoodEditor,
      popup: true,
      popupPosition: 'under'
    }
  }

  return undefined
}
```

Here is a full example:

- The column 'Value' holds data of different types as shown in the column 'Type' (numbers/genders/moods).
- `colDef.cellEditorSelector` is a function that returns the name of the component to use to edit based on the type of data for that row
- Edit a cell by double clicking to observe the different editors used. 

<grid-example title='Dynamic Editor Component' name='dynamic-editor-component' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel", "richselect"], "exampleHeight": 450, "includeNgFormsModule": true }'></grid-example>

## Dynamic Props

The `colDef.cellEditorParams` function allows dynamic props independently of the Editor selection. For example you might have a 'City' column that has values based on the 'Country' column.

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

Below shows an example with dynamic props. The following can be noted:

- Column **Gender** uses a Cell Component for both the grid and the editor.
- Column **Country** allows country selection, with `cellHeight` being used to make each entry 50px tall. If the currently selected city for the row doesn't match a newly selected country, the city cell is cleared.
- Column **City** uses dynamic parameters to display values for the selected country, and uses `formatValue` to add the selected city's country as a suffix.
- Column **Address** uses the large text area editor.

<grid-example title='Dynamic Parameters' name='dynamic-parameters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect", "menu", "columnpanel"], "exampleHeight": 520, "extras": ["fontawesome"] }'></grid-example>


## Custom Props

The property `colDef.cellEditorParams` allows custom props to be passed to editors.

md-include:complementing-component-javascript.md
md-include:complementing-component-angular.md
md-include:complementing-component-react.md
md-include:complementing-component-vue.md

## Popup Editor

An editor can be Inline or Popup.

An Inline Editor Component will be placed inside the Grid's Cell, replacing the Cell contents when active.

A Popup Editor Component appears in a popup over the Cell. Popup Editors are not constrained to the Cells dimensions.

<framework-specific-section frameworks="react">
|Configure that an Editor is in a popup by setting `cellEditorPopup=true` on the [Column Definition](/column-definitions/).
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
|Configure that a Custom Cell Editor is in a popup in one of the following ways:
|1. Specify `cellEditorPopup=true` on the [Column Definition](/column-definitions/).
|1. Implement the `isPopup()` method on the Custom Cell Editor and return `true`.
</framework-specific-section>

<snippet>
colDefs = [
  {
    cellEditor: MyPopupEditor,
    cellEditorPopup: true
    // ...
  }
]
</snippet>

<framework-specific-section frameworks="react">
|Popup Editors appear over the editing Cell. Configure the Popup Editor to appear below the Cell by setting `cellEditorPopupPosition='under'` on the [Column Definition](/column-definitions/).
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
|Popup Editors appear over the editing Cell. Configure the Popup Editor to appear below the Cell in one of the following ways:
|1. Implement the `getPopupPosition()` method on the Custom Cell Editor and return `under`.
|1. Specify `cellEditorPopupPosition='under'` on the [Column Definition](/column-definitions/).
</framework-specific-section>

<snippet>
colDef = {
  cellEditorPopup: true,
  cellEditorPopupPosition: 'under',
  // ...other props
}
</snippet>

## Keyboard Navigation

In Custom Editors, you may wish to disable some of the Grids keyboard navigation. For example, if you are providing a simple text editor, you may wish the grid to do nothing when you press the right and left arrows (the default is the grid will move to the next / previous cell) as you may want the right and left arrows to move the cursor inside your editor. In other cell editors, you may wish the grid to behave as normal.

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


## Accessing Instances

After the grid has created an instance of an Editor Component for a Cell it is possible to access that instance. This is useful if you want to call a method that you provide on the Editor that has nothing to do with the operation of the grid. Accessing Editors is done using the grid API `getCellEditorInstances(params)`.

<api-documentation source='grid-api/api.json' section='editing' names='["getCellEditorInstances"]'></api-documentation>

If you are doing normal editing, then only one cell is editable at any given time. For this reason if you call `getCellEditorInstances()` with no params, it will return back the editing cell's editor if a cell is editing, or an empty list if no cell is editing.

An example of calling `getCellEditorInstances()` is as follows:

<framework-specific-section frameworks="javascript,angular,vue">
<snippet transform={false}>
|const instances = api.getCellEditorInstances(params);
|if (instances.length > 0) {
|    const instance = instances[0];
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="react">
<snippet transform={false}>
|const instances = api.getCellEditorInstances(params);
|if (instances.length > 0) {
|    getInstance(instances[0], instance => {
|        ...
|    });
|}
</snippet>
</framework-specific-section>

The example below shows using `getCellEditorInstances`. The following can be noted:

- All cells are editable.
- **First Name** and **Last Name** use the default editor.
- All other columns use the provided `MySimpleCellEditor` editor.
- The example sets an interval to print information from the active cell editor. There are three results: 1) No editing 2) Editing with default cell renderer and 3) editing with the custom cell editor. All results are printed to the developer console.

<grid-example title='Get Editor Instance' name='get-editor-instance' type='mixed' options='{ }'></grid-example>




## Datepicker Cell Editing Example

The example below illustrates:

- 'Date' column uses a Component cell editor that allows you to pick a date using jQuery UI Datepicker.

<grid-example title='Datepicker Cell Editing' name='datepicker-cell-editing' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"], "extras": ["jquery", "jqueryui"] }'></grid-example>

## Another Example

- 'Gender' column uses a Component cell editor that allows choices via a 'richSelect' (AG Grid Enterprise only), with values supplied by complementing the editor parameters.
- 'Age' column uses a Component cell editor that allows simple integer input only.
- 'Mood' column uses a custom Component cell editor and renderer that allows choice of mood based on image selection.
- 'Address' column uses a Component cell editor that allows input of multiline text via a 'largeText'. <kbd>⇥ Tab</kbd> and <kbd>⎋ Esc</kbd> (amongst others) will exit editing in this field, <kbd>⇧ Shift</kbd>+<kbd>↵ Enter</kbd> will allow newlines.
- 'Country' columns shows using 'richSelect' for a complex object - the cell renderer takes care of only rendering the country name.

<grid-example title='Simple Editor Components' name='component-editor-2' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "richselect"], "exampleHeight": 370, "includeNgFormsModule" : true, "extras": ["fontawesome"] }'></grid-example>
