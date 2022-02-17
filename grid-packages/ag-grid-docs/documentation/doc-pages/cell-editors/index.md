---
title: "Cell Editor Components"
---



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
        return { component: NumericCellEditor };
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
