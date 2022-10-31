---
title: "Reference Data"
---

This section describes two different strategies for managing reference data in your application. Both approaches implement the same grid example so they can be easily compared.

[[note]]
| The term **Reference Data** is used here in a general way to describe data which can be defined using
| a key / value pair relationship (e.g. `'tyt': 'Toyota'`). This data is typically static in nature, i.e.
| it is not expected to change between server requests.

The examples contained within this section use the following reference data. Note that the data returned from the server only contains codes (keys) which must be mapped to names (values) for display purposes.

```js
// data from server
const rowData = [
    { make: 'tyt', exteriorColour: 'fg', interiorColour: 'bw', price: 35000 },
    { make: 'frd', exteriorColour: 'bw', interiorColour: 'cb', price: 32000 },
    ...
]

// supporting reference data
const carMappings = {
    'tyt': 'Toyota',
    'frd': 'Ford',
    'prs': 'Porsche',
    'nss': 'Nissan'
};

const colourMappings = {
    'cb': 'Cadet Blue',
    'bw': 'Burlywood',
    'fg': 'Forest Green'
};
```

## Using Value Handlers

Value Handlers can be used to map keys contained within the row data to their corresponding display values. This approach involves more coding but allows for different data formats and offers more flexibility managing the data.

The main idea of this approach is to use a `valueFormatter` to convert the code (key) to a value which is displayed in the cell. Then use a `valueParser` to convert the name back to a code (key) when saving it down into the underlying data.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'make',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: extractValues(carMappings)
            },
            // convert code to value
            valueFormatter: params => {
                return lookupValue(carMappings, params.value);
            },
            // convert value to code
            valueParser: params => {
                return lookupKey(carMappings, params.newValue);
            }
        }
    ]
}
</snippet>

[[note]]
| When editing using Cell Editors it's important to ensure the underlying data is updated with the codes (keys) rather than the values that are displayed in the cells.

When using the `TextCellEditor` with reference data, you may want to display the formatted text rather than the code. In this case you should also include the `useFormatter` property as follows:

```js
cellEditor: 'agTextCellEditor',
cellEditorParams: {
   useFormatter: true
}
```

### Example: Value Handlers

The following example demonstrates how `Value Handlers` can be combined to work with reference data:

- **'Make' Column:** uses the built-in `'select'` Cell Editor. Mapped names are displayed in the dropdown list and selections are saved as `'make'` codes in the underlying data.

- **'Exterior Colour' Column:** uses the built-in `'richSelect'` Cell Editor. Mapped names are displayed in the dropdown list and selections are saved as `'colour'` codes in the underlying data.

- **'Interior Colour' Column:** uses a Text Cell Editor with `useFormatter=true`. Mapped names are displayed in the cells and edited values are saved as `'colour'` codes in the underlying data. (Note: a valid name must be entered.)

- **Set Filters:** display a list of names rather than codes.

- **'Price' Columns:** additionally demonstrate the use of `valueGetters` and `valueSetters`.

<grid-example title='Value Handlers' name='ref-data-value-handler' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect", "setfilter", "menu", "columnpanel"] }'></grid-example>

## Using the 'refData' Property

Here we present the same example but this time using the `refData` `ColDef` property. This approach requires less coding and is more straightforward, but might not be flexible enough for scenarios involving more complex reference data formats.

<api-documentation source='column-properties/properties.json' section='columns' names='["refData"]'></api-documentation>

All that is required with this approach is to specify the `refData` and the grid will take care of the
rest, as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'make',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
               values: extractValues(carMappings)
            },
            refData: carMappings
        }
    ]
}
</snippet>

Like in the previous example using Value Handlers, where the underlying data contains codes, the grid will use the specified reference data to display the associated values in the cells and save down the codes (keys) in the data when editing.

### Example: 'refData' Property

The following example demonstrates how the `refData` property simplifies working with reference data:

- **'Make' Column:** uses the built-in `'select'` Cell Editor with the `refData` property specified. Mapped names are displayed in the dropdown list and selections are saved as `'make'` codes in the underlying data.

- **'Exterior Colour' Column:** uses the built-in `'richSelect'` Cell Editor with the `refData` property specified. Mapped names are displayed in the dropdown list and selections are saved as `'colour'` codes in the underlying data.

- **'Interior Colour' Column:** uses a Text Cell Editor with the `refData` property specified. Mapped names are displayed in the cells and edited values are saved as `'colour'` codes in the underlying data. (Note: a valid name must be entered.)

- **Set Filters:** display a list of names rather than codes.

- **'Price' Columns:** additionally demonstrate the use of `valueGetters` and `valueSetters`.

<grid-example title='Ref Data Property' name='ref-data-property' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect", "setfilter", "menu", "columnpanel"] }'></grid-example>
