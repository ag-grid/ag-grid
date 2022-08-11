---
title: "Cell Editors"
---

A Cell Editor Component is the UI that appears, normally inside the Cell, that takes care of the Edit operation. You can select from the [Provided Cell Editors](/provided-cell-editors/) or create your own [Custom Cell Editor Components](/component-cell-editor/).

Cell Editor Components are configured using the `cellEditor` property of the [Column Definition](/column-definitions/).

<snippet>
const gridOptions = {
    columnDefs: [
        { 
            field: 'name', 
            editable: true, 
            // uses the provided Text Cell Editor (which is the default)
            cellEditor: 'agTextCellEditor' 
        },
        { 
            field: 'age', 
            editable: true, 
            // uses a custom Cell Editor
            cellEditor: CustomAgeCellEditor,
            // provides params to the Cell Editor
            cellEditorParams: {
                foo: 'bar'
            },
            // show this editor in a popup
            cellEditorPopup: true,
            // position the popup under the cell
            cellEditorPopupPosition: 'under'
        }
    ]
}
</snippet>

## Popup vs In Cell

An editor can be in a popup or in cell.

### In Cell

In Cell editing means the contents of the cell will be cleared and the editor will appear inside the cell. The editor will be constrained to the boundaries of the cell, so if it is larger than the provided area it will be clipped. When editing is finished, the editor will be removed and the renderer will be placed back inside the cell again.

### Popup

If you want your editor to appear in a popup (such as a dropdown list), then you can have it appear in a popup. The popup will appear over the cell, however it will not change the contents of the cell. Behind the popup the cell will remain intact until after editing is finished which will result in the cell being refreshed.

From a lifecycle and behaviour point of view, 'in cell' and 'popup' have no impact on the editor. You can create a cell editor and change this property and observe how your editor behaves in each way.

### Configure Popup

[[only-react]]
|Configure that an Editor is in a popup by setting `cellEditorPopup=true` on the [Column Definition](/column-definitions/).

[[only-javascript-or-angular-or-vue]]
|Configure that an Editor is in a popup in one of the following ways:
|1. For [Custom Cell Editors](/component-cell-editor/), implement the `isPopup()` method on the Custom Cell Editor OR specify `cellEditorPopup=true` on the [Column Definition](/column-definitions/).
|1. For [Provided Cell Editors](/provided-cell-editors/), you do not need to to anything, as `isPopup` is already implemented on these.



## Many Editors One Column

It is also possible to use different editors for different rows in the same column. To configure this set `colDef.cellEditorSelector` to a function that returns alternative values for `cellEditor` and `cellEditorParams`.

The `params` passed to `cellEditorSelector` are the same as those passed to the [Cell Editor Component](/component-cell-editor/). Typically the selector will use this to check the rows contents and choose an editor accordingly.

The result is an object with `component` and `params` to use instead of `cellEditor` and `cellEditorParams`.

This following shows the Selector always returning back an AG Rich Select Cell Editor:

```js
cellEditorSelector: params => {
    return {
        component: 'agRichSelectCellEditor',
        params: { values: ['Male', 'Female'] },
        popup: true
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
      },
      popup: true
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

The return type for the selector is `CellEditorSelectorResult` and has the following attributes:

<interface-documentation interfaceName='CellEditorSelectorResult' config='{"description":""}'></interface-documentation>

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


## Datepicker Cell Editing Example

The example below illustrates:

- 'Date' column uses a Component cell editor that allows you to pick a date using jQuery UI Datepicker.

<grid-example title='Datepicker Cell Editing' name='datepicker-cell-editing' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"], "extras": ["jquery", "jqueryui"] }'></grid-example>
