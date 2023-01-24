---
title: "Saving Values"
---

After editing a cell, the grid normally inserts the new value into your data using the column definition `field` attribute. This covers the most common case, where the grid owns the data state and treats the data as mutable.

This page discusses alternatives to this approach.

[Value Setters](/value-setters/#value-setter) provides an alternative to using `field` for setting the data. Use `valueSetter` if you want the grid to manage the data (ie update the data inline) but you want to update in a way other than using `field`. This is useful if you are not using `field`, or somehow need to manipulate the data in another way (e.g. the data item isn't a simple key / value pair map, but contains a more complex structure).

[Read Only Grid](/value-setters/#read-only-grid) stops the grid from updating data, and relies on the application to make the update after the edit is complete. Use this if you want to manage the grid data state externally, such as in a Redux store.

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

- Column Name uses `valueGetter` to combine the values from the two attributes `firstName` and `lastName` (separated by a space) and `valueSetter` is used to break the value up into the two same attributes.

- Column A uses `field` for both getting and setting the value. This is the simple case for comparison.

- Column B uses `valueGetter` and `valueSetter` instead of field for getting and setting the value. This allows the value to be parsed into the correct type before being saved.

- Column C.X and C.Y use `valueGetter` to get the value from an embedded object. They then use `valueSetter` to set the value into the embedded object while also making sure the correct structure exists (this structure creation would not happen if using field).

<grid-example title='Value Setters' name='example-setters' type='generated'></grid-example>

## Read Only Grid

Read Only is a mode in the grid whereby Cell Editing will not update the data inside the grid. Instead the grid fires `cellEditRequest` events allowing the application to process the update request. To enable this mode, set the grid property `readOnlyGrid=true`.

[[only-javascript]]
|```ts
|const gridOptions = {
|    readOnlyGrid: true,
|    onCellEditRequest: event => {
|        console.log('Cell Editing updated a cell, but the grid did nothing!');
|        // the application should update the data somehow
|    }
|}
|```

[[only-angular]]
|```ts
|<ag-grid-angular
|    [readOnlyGrid]="true"
|    (cellEditRequest)="onCellEditRequest($event)"
|    /* other grid options ... */>
|</ag-grid-angular>
|
|this.onCellEditRequest = event => {
|    console.log('Cell Editing updated a cell, but the grid did nothing!');
|    // the application should update the data somehow
|};
|```


[[only-react]]
|```jsx
|const readOnlyGrid = true;
|const onCellEditRequest = event => {
|    console.log('Cell Editing updated a cell, but the grid did nothing!');
|    // the application should update the data somehow
|};
|
|<AgGridReact readOnlyGrid={readOnlyGrid} onCellEditRequest={onCellEditRequest}></AgGridReact>
|```


[[only-vue]]
|```ts
|<ag-grid-vue
|    :readOnlyGrid="true"
|    @cell-edit-request="onCellEditRequest"
|    /* other grid options ... */>
|</ag-grid-vue>
|
|this.onCellEditRequest = event => {
|    console.log('Cell Editing updated a cell, but the grid did nothing!');
|    // the application should update the data somehow
|};
|```

The example below has Cell Editing enabled, however the editing does nothing because `readOnlyGrid=true` is set. The application listens for `cellEditRequest` event and prints to the console. As the application does not try to update the data, the cell keeps its old value, giving the impression that editing is not working.

<grid-example title='Read Only Grid - Not Implemented' name='read-only' type='generated' options='{"exampleHeight": 350}'></grid-example>

This next example extends the above by getting the application to update the data.

1. The application listens for `cellEditRequest` and updates the Row Data.
1. The Row Data has ID's and `getRowId` is implemented. This allows the grid to only refresh the desired row after new Row Data is set.

<grid-example title='Read Only Grid - Row Data' name='read-only-row-data' type='generated'></grid-example>

This final example is similar to before, except it uses Transactions to update the data after the edit rather than updating the whole Row Data.

<grid-example title='Read Only Grid - Transactions' name='read-only-transactions' type='generated'></grid-example>
