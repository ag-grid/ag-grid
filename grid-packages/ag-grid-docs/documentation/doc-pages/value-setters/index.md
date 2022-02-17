---
title: "Saving Values"
---

After editing a cell, the grid normally inserts the new value into your data using the column definition `field` attribute. There are other ways to save values the result from edits which are discussed here.

## Value Setter

A Value Setter is the inverse of a [Value Getter](/value-getters/). Where the value getter allows getting values from your data using a function rather than a field, the value setter allows you to set values into your data using a function rather than specifying a field.

<snippet>
|const gridOptions = {
|    columnDefs: [
|        // Option 1: using field for getting and setting the value
|        { field: 'name' },
|
|        // Options 2: using valueGetter and valueSetter - value getter used to get data
|        {
|            valueGetter: params => {
|                return params.data.name;
|            },
|            valueSetter: params => {
|                params.data.name = params.newValue;
|                return true;
|            }
|        }
|    ]
|}
</snippet>

A value setter should return `true` if the value was updated successfully and `false` if the value was not updated (including if the value was not changed). When you return `true`, the grid knows it must refresh the cell.

<api-documentation source='column-properties/properties.json' section="editing" names='["valueSetter"]' ></api-documentation>

The example below demonstrates value setters working alongside value getters
(value setters are typically only used alongside value getters). Note
the following:

- All columns are editable. After an edit, the example prints the updated row data to the console to show the impact of the edit.

- Column A uses `field` for both getting and setting the value. This is the simple case for comparison.

- Column B uses `valueGetter` and `valueSetter` instead of field for getting and setting the value. This allows the value to be parsed into the correct type before being saved.

- Column Name uses `valueGetter` to combine the value from the two attributes `firstName` and `lastName` and `valueSetter` is used to break the value up into the two same attributes.

- Column C.X and C.Y use `valueGetter` to get the value from an embedded object. They then use `valueSetter` to set the value into the embedded object while also making sure the correct structure exists (this structure creation would not happen if using field).

<grid-example title='Value Setters' name='example-setters' type='generated'></grid-example>

