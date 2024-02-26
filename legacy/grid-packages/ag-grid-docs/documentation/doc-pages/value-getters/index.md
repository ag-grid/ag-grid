---
title: "Getting Values"
---

Values are mapped into Cells using either `field` or `valueGetter`
from the Column Definition.

## Field

The Column Definition `field` property maps values from the row data object to the Column's Cells.

Dot notation (e.g. `medals.gold`) is supported for embedded objects. Suppress dot notation with the grid propery `suppressFieldDotNotation=true` if the data has dots in the field names.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    rowData: [
        {
            athlete: 'Michael Phelps',
            medals: {
                gold: 8, silver: 1, bronze: 0
            }
        }
    ],
    columnDefs: [
        // simple field attribute
        { field: 'athlete' },
        // using dot notation, a Header Name is usally needed
        { field: 'medals.gold', headerName: 'Gold' },
    ],
}
</snippet>

<grid-example title='Nested Row Data Example' name='column-fields' type='generated'></grid-example>


## Header Names

When no header name is provided, the grid will derieve the header name from the provided `field`. The grid will assume the field is Camel Case and will reverse engineer the readable name.

<snippet suppressFrameworkContext="true" spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // header name will be 'Athlete'
        { field: 'athlete' },
        // header name will be 'First Name'
        { field: 'firstName' }
    ]
}
</snippet>

## Value Getter

A Value Getter is a function that gets called that returns the value.
Typically `field` is used if it can and `valueGetter` is used when retrieving the data requires more logic.
Columns with Value Getter's usually have stated Header Name's as the grid cannot derived Header Names from
Value Getters like it does with Fields.

<snippet suppressFrameworkContext="true" spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // achieves the same as using 'athlete' for the field
        { headerName: 'Athlete', valueGetter: p => p.data.athlete },
        // using valueGetter to combine 3 values into 1
        { headerName: 'Total Medals', valueGetter: p => p.data.bronze + p.data.silver + p.data.gold }
    ]
}
</snippet>

<api-documentation source='column-properties/properties.json' section="columns" names='["valueGetter"]'></api-documentation>

<note>
All valueGetters must be pure functions. That means, given the same state of your
data, it should consistently return the same result. This is important as the grid will only call your
valueGetter once during a redraw, even though the value may be used multiple times. For example, the
value will be used to display the cell value, however it can additionally be used to provide values
to an aggregation function when grouping.
</note>

### Example Value Getters

The example below demonstrates `valueGetter`. The following can be noted from the demo:

- Columns A and B are simple columns using `field`

- Value Getters are used in all subsequent columns as follows:
    - Column '#' prints the row number, taken from the [Row Node](/row-object/).
    - Column 'A+B' adds A and B.
    - Column 'A * 1000' multiplies A by 1000.
    - Column 'B * 137' multiplies B by 137.
    - Column 'Random' doesn't take any value from the data, rather it returns a random value.
    - Column 'Chain' takes the value 'A+B' and works on it further, thus chaining value getters.
    - Column 'Const' returns back the same value for each column.

<grid-example title='Value Getters' name='value-getters' type='generated'></grid-example>

### Header Value Getters

Use `headerValueGetter` instead of `colDef.headerName` to allow dynamic header names.

<api-documentation source='column-properties/properties.json' section="header" names='["headerValueGetter"]' ></api-documentation>

The parameters for `headerValueGetter` differ from standard `valueGetter` as follows:

- Only one of column or columnGroup will be present, depending on whether it's a column or a column group.
- Parameter `location` allows you to have different column names depending on where the column is appearing, eg you might want to have a different name when the column is in the column drop zone or the toolbar.

See the [Column Tool Panel Example](/tool-panel-columns/#columns-tool-panel-example) for an example of `headerValueGetter` used in different locations, where you can change the header name depending on where the name appears.

### Filter Value Getters

By default, the values supplied to the filter are retrieved from the data based on the `field` attribute. This can be overridden by providing a `filterValueGetter` in the Column Definition as shown below. This is similar to using a normal Value Getter, but is specific to the filter.

<api-documentation source='column-properties/properties.json' section="filtering" names='["filterValueGetter"]' ></api-documentation>
